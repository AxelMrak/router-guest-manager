import { useState } from "react";
import type { GuestDeviceInfo } from "../types";

interface GuestsTableProps {
  guests: GuestDeviceInfo[];
  onBlock: (mac: string) => void;
  onUnblock: (mac: string) => void;
  onSetTimer: (mac: string, minutes: number) => void;
  onRemoveTimer: (mac: string) => void;
  isLoading: boolean;
}

function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec < 1024) return `${bytesPerSec} B/s`;
  if (bytesPerSec < 1048576) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSec / 1048576).toFixed(1)} MB/s`;
}

function TimerBadge({ device, onSet, onRemove }: { device: GuestDeviceInfo; onSet: (mac: string, m: number) => void; onRemove: (mac: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("30");

  if (!device.online) return <span className="text-xs text-white/30">—</span>;

  if (device.timerMinutes && device.timerExpiresAt) {
    const now = Math.floor(Date.now() / 1000);
    const remaining = device.timerExpiresAt - now;
    const isExpired = remaining <= 0;
    const color = isExpired ? "text-rose-400/60" : remaining < 300 ? "text-amber-400/60" : "text-emerald-400/60";

    return (
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${color}`}>
          {isExpired ? "Expirado" : formatSeconds(Math.max(0, remaining))}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(device.mac); }}
          className="text-xs text-white/25 hover:text-rose-400/60 transition-colors"
        >
          ✕
        </button>
      </div>
    );
  }

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const minutes = parseInt(value, 10);
          if (minutes >= 1) {
            onSet(device.mac, minutes);
            setEditing(false);
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1"
      >
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min="1"
          className="w-12 bg-white/[0.06] border border-white/[0.10] rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-sky-500/40"
        />
        <span className="text-xs text-white/30">min</span>
        <button type="submit" className="text-xs text-sky-400/80 hover:text-sky-400 ml-1">✓</button>
        <button type="button" onClick={() => setEditing(false)} className="text-xs text-white/25 hover:text-white/50">✕</button>
      </form>
    );
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      className="text-xs text-white/25 hover:text-sky-400/60 transition-colors"
    >
      + timer
    </button>
  );
}

function ExpandedRow({ device }: { device: GuestDeviceInfo }) {
  return (
    <tr>
      <td colSpan={10} className="bg-white/[0.02] border-b border-white/[0.04]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 text-sm">
          <div><span className="text-white/30">MAC:</span> <span className="text-white/60 ml-2 font-mono text-xs">{device.mac}</span></div>
          <div><span className="text-white/30">IP:</span> <span className="text-white/60 ml-2">{device.ip}</span></div>
          <div><span className="text-white/30">Hostname:</span> <span className="text-white/60 ml-2">{device.hostname || "—"}</span></div>
          <div><span className="text-white/30">Interfaz:</span> <span className="text-white/60 ml-2 font-mono text-xs">{device.ifname}</span></div>
          <div><span className="text-white/30">TX Rate:</span> <span className="text-white/60 ml-2">{device.txrate > 0 ? `${device.txrate} Mbps` : "—"}</span></div>
          <div><span className="text-white/30">RX Rate:</span> <span className="text-white/60 ml-2">{device.rxrate > 0 ? `${device.rxrate} Mbps` : "—"}</span></div>
          <div><span className="text-white/30">802.11k:</span> <span className={`ml-2 ${device.support_11k ? "text-emerald-400/60" : "text-white/30"}`}>{device.support_11k ? "Sí" : "No"}</span></div>
          <div><span className="text-white/30">802.11v:</span> <span className={`ml-2 ${device.support_11v ? "text-emerald-400/60" : "text-white/30"}`}>{device.support_11v ? "Sí" : "No"}</span></div>
          {device.connectedAt > 0 && (
            <div className="col-span-2"><span className="text-white/30">Conectado desde:</span> <span className="text-white/60 ml-2">{new Date(device.connectedAt * 1000).toLocaleString()}</span></div>
          )}
        </div>
      </td>
    </tr>
  );
}

function SkeletonRows() {
  return Array.from({ length: 3 }).map((_, i) => (
    <tr key={i} className="border-b border-white/[0.04] animate-pulse">
      {Array.from({ length: 8 }).map((_, j) => (
        <td key={j} className="px-4 py-3.5"><div className="h-4 bg-white/8 rounded w-16" /></td>
      ))}
    </tr>
  ));
}

export function GuestsTable({ guests, onBlock, onUnblock, onSetTimer, onRemoveTimer, isLoading }: GuestsTableProps) {
  const [expandedMac, setExpandedMac] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Dispositivo", "Tipo", "Conectado", "Subida", "Bajada", "Señal", "Timer", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody><SkeletonRows /></tbody>
        </table>
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-12 text-center">
        <p className="text-white/30 text-sm">No hay dispositivos invitados</p>
      </div>
    );
  }

  const sorted = [...guests].sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    return b.seconds - a.seconds;
  });

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {["Dispositivo", "Tipo", "Conectado", "Subida", "Bajada", "Señal", "Timer", "Acciones"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((device) => {
            const isExpanded = expandedMac === device.mac;
            return (
              <>
                <tr
                  key={device.mac}
                  onClick={() => setExpandedMac(isExpanded ? null : device.mac)}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`transition-transform ${isExpanded ? "rotate-90" : ""} text-white/20 text-xs`}>▸</span>
                      <div>
                        <p className="text-white text-sm font-medium">{device.alias || device.hostname || device.mac}</p>
                        {device.alias && device.hostname && <p className="text-white/25 text-xs">{device.hostname}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      !device.is_wifi ? "bg-white/[0.06] text-white/50" :
                      device.is_5g ? "bg-sky-500/8 text-sky-400/80" : "bg-amber-500/8 text-amber-400/80"
                    }`}>
                      {!device.is_wifi ? "⬡ Eth" : device.is_5g ? "⟳ 5G" : "⌂ 2.4G"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${device.online ? "bg-emerald-400" : "bg-white/20"}`} />
                      <span className="text-white/40 text-xs">{formatSeconds(device.seconds)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={device.up_speed > 0 ? "text-emerald-400/60" : "text-white/40"}>
                      {formatSpeed(device.up_speed)} ↑
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={device.down_speed > 0 ? "text-emerald-400/60" : "text-white/40"}>
                      {formatSpeed(device.down_speed)} ↓
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-mono ${device.rssi > -60 ? "text-emerald-400/60" : device.rssi > -75 ? "text-amber-400/60" : "text-rose-400/60"}`}>
                      {device.rssi} dBm
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <TimerBadge device={device} onSet={onSetTimer} onRemove={onRemoveTimer} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {device.blocked ? (
                        <button
                          onClick={() => onUnblock(device.mac)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/8 hover:bg-emerald-500/15 text-emerald-400/80 transition-colors"
                        >
                          Desbloquear
                        </button>
                      ) : (
                        <button
                          onClick={() => onBlock(device.mac)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-rose-500/8 hover:bg-rose-500/15 text-rose-400/80 transition-colors"
                        >
                          Bloquear
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {isExpanded && <ExpandedRow device={device} />}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
