import { useState } from "react";
import type { DeviceInfo } from "../types";

export interface DeviceFilters {
  status: "all" | "online" | "offline";
  type: "all" | "5g" | "2.4g" | "wired";
  guest: "all" | "yes" | "no";
  blocked: "all" | "yes" | "no";
}

interface DevicesTableProps {
  devices: DeviceInfo[];
  onBlock: (mac: string) => void;
  onUnblock: (mac: string) => void;
  isLoading: boolean;
  filters: DeviceFilters;
  onFiltersChange: (filters: DeviceFilters) => void;
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

function ConnectionTypeBadge({ device }: { device: DeviceInfo }) {
  if (!device.is_wifi) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/[0.06] text-white/50">
        ⬡ Ethernet
      </span>
    );
  }
  if (device.is_5g) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-sky-500/8 text-sky-400/80">
        ⟳ 5 GHz
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/8 text-amber-400/80">
      ⌂ 2.4 GHz
    </span>
  );
}

function StatusBadge({ online }: { online: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${online ? "bg-emerald-400" : "bg-white/20"}`} />
      <span className={`text-xs font-medium ${online ? "text-emerald-400/80" : "text-white/30"}`}>
        {online ? "En línea" : "Desconectado"}
      </span>
    </span>
  );
}

function GuestBadge({ guest }: { guest: boolean }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-sky-500/8 text-sky-400/80">
      {guest ? "Sí" : "No"}
    </span>
  );
}

function BlockedBadge({ blocked }: { blocked: boolean }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-rose-500/8 text-rose-400/80">
      {blocked ? "Sí" : "No"}
    </span>
  );
}

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? "bg-sky-500/15 text-sky-400/80 border border-sky-500/20"
          : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60"
      }`}
    >
      {label}
    </button>
  );
}

function FilterSection({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/30 w-16">{label}</span>
      <div className="flex gap-1.5">
        {options.map((opt) => (
          <FilterPill
            key={opt.value}
            label={opt.label}
            active={value === opt.value}
            onClick={() => onChange(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}

function ExpandedRow({ device }: { device: DeviceInfo }) {
  return (
    <div className="grid grid-cols-4 gap-x-8 gap-y-3 px-4 py-4 bg-white/[0.02]">
      <div>
        <p className="text-xs text-white/30 mb-1">MAC</p>
        <p className="text-sm text-white/50 font-mono">{device.mac}</p>
      </div>
      <div>
        <p className="text-xs text-white/30 mb-1">IP</p>
        <p className="text-sm text-white/50 font-mono">{device.ip}</p>
      </div>
      <div>
        <p className="text-xs text-white/30 mb-1">Hostname</p>
        <p className="text-sm text-white/50">{device.hostname || "—"}</p>
      </div>
      <div>
        <p className="text-xs text-white/30 mb-1">Interfaz</p>
        <p className="text-sm text-white/50">{device.ifname}</p>
      </div>
      <div>
        <p className="text-xs text-white/30 mb-1">TX Rate</p>
        <p className="text-sm text-white/50">{device.txrate} Mbps</p>
      </div>
      <div>
        <p className="text-xs text-white/30 mb-1">RX Rate</p>
        <p className="text-sm text-white/50">{device.rxrate} Mbps</p>
      </div>
      <div>
        <p className="text-xs text-white/30 mb-1">802.11k</p>
        <p className={`text-sm ${device.support_11k ? "text-emerald-400/60" : "text-white/30"}`}>
          {device.support_11k ? "✓" : "—"}
        </p>
      </div>
      <div>
        <p className="text-xs text-white/30 mb-1">802.11v</p>
        <p className={`text-sm ${device.support_11v ? "text-emerald-400/60" : "text-white/30"}`}>
          {device.support_11v ? "✓" : "—"}
        </p>
      </div>
    </div>
  );
}

export function DevicesTable({ devices, onBlock, onUnblock, isLoading, filters, onFiltersChange }: DevicesTableProps) {
  const [expandedMac, setExpandedMac] = useState<string | null>(null);

  const filteredDevices = devices.filter((d) => {
    if (filters.status === "online" && !d.online) return false;
    if (filters.status === "offline" && d.online) return false;
    if (filters.type === "5g" && (!d.is_wifi || !d.is_5g)) return false;
    if (filters.type === "2.4g" && (!d.is_wifi || d.is_5g)) return false;
    if (filters.type === "wired" && d.is_wifi) return false;
    if (filters.guest === "yes" && !d.guest) return false;
    if (filters.guest === "no" && d.guest) return false;
    if (filters.blocked === "yes" && !d.blocked) return false;
    if (filters.blocked === "no" && d.blocked) return false;
    return true;
  });

  const sorted = [...filteredDevices].sort((a, b) => {
    if (a.guest !== b.guest) return a.guest ? -1 : 1;
    return b.seconds - a.seconds;
  });

  const updateFilter = <K extends keyof DeviceFilters>(key: K, value: DeviceFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  if (isLoading) {
    return (
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <div className="h-5 bg-white/[0.06] rounded animate-pulse w-48" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Alias", "Tipo", "Invitado", "Conectado", "Subida", "Bajada", "Señal", "Bloqueado", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-left uppercase tracking-wide text-xs text-white/40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-t border-white/[0.06]">
                {[...Array(9)].map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-5 bg-white/[0.06] rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* Filter Bar */}
      <div className="px-4 py-3 border-b border-white/[0.06] space-y-2">
        <div className="flex flex-wrap gap-3">
          <FilterSection
            label="Estado"
            options={[
              { value: "all", label: "Todo" },
              { value: "online", label: "En línea" },
              { value: "offline", label: "Desconectado" },
            ]}
            value={filters.status}
            onChange={(v) => updateFilter("status", v as DeviceFilters["status"])}
          />
          <FilterSection
            label="Tipo"
            options={[
              { value: "all", label: "Todo" },
              { value: "5g", label: "5 GHz" },
              { value: "2.4g", label: "2.4 GHz" },
              { value: "wired", label: "Cableado" },
            ]}
            value={filters.type}
            onChange={(v) => updateFilter("type", v as DeviceFilters["type"])}
          />
          <FilterSection
            label="Invitado"
            options={[
              { value: "all", label: "Todo" },
              { value: "yes", label: "Sí" },
              { value: "no", label: "No" },
            ]}
            value={filters.guest}
            onChange={(v) => updateFilter("guest", v as DeviceFilters["guest"])}
          />
          <FilterSection
            label="Bloqueado"
            options={[
              { value: "all", label: "Todo" },
              { value: "yes", label: "Sí" },
              { value: "no", label: "No" },
            ]}
            value={filters.blocked}
            onChange={(v) => updateFilter("blocked", v as DeviceFilters["blocked"])}
          />
        </div>
        <p className="text-xs text-white/30">
          Mostrando {sorted.length} de {devices.length} dispositivos
        </p>
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-white/30">No se encontraron dispositivos</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-4 py-3 text-left uppercase tracking-wide text-xs text-white/40 font-medium w-6"></th>
              <th className="px-4 py-3 text-left uppercase tracking-wide text-xs text-white/40 font-medium">Alias</th>
              <th className="px-4 py-3 text-left uppercase tracking-wide text-xs text-white/40 font-medium">Tipo</th>
              <th className="px-4 py-3 text-left uppercase tracking-wide text-xs text-white/40 font-medium">Invitado</th>
              <th className="px-4 py-3 text-left uppercase tracking-wide text-xs text-white/40 font-medium">Conectado</th>
              <th className="px-4 py-3 text-left uppercase tracking-wide text-xs text-white/40 font-medium">Subida</th>
              <th className="px-4 py-3 text-left uppercase tracking-wide text-xs text-white/40 font-medium">Bajada</th>
              <th className="px-4 py-3 text-left uppercase tracking-wide text-xs text-white/40 font-medium">Señal</th>
              <th className="px-4 py-3 text-left uppercase tracking-wide text-xs text-white/40 font-medium">Bloqueado</th>
              <th className="px-4 py-3 text-left uppercase tracking-wide text-xs text-white/40 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((device) => {
              const isExpanded = expandedMac === device.mac;
              return (
                <>
                  <tr
                    key={device.mac}
                    className="border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setExpandedMac(isExpanded ? null : device.mac)}
                  >
                    <td className="px-4 py-3">
                      <span className={`text-white/30 text-xs transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                        ▸
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge online={device.online} />
                        <span className="text-sm text-white/70">{device.alias || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ConnectionTypeBadge device={device} />
                    </td>
                    <td className="px-4 py-3">
                      <GuestBadge guest={device.guest} />
                    </td>
                    <td className="px-4 py-3 text-sm text-white/50">{formatSeconds(device.seconds)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${device.up_speed > 0 ? "text-emerald-400/60" : "text-white/40"}`}>
                        ↑ {formatSpeed(device.up_speed)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${device.down_speed > 0 ? "text-emerald-400/60" : "text-white/40"}`}>
                        ↓ {formatSpeed(device.down_speed)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/50">{device.rssi}</td>
                    <td className="px-4 py-3">
                      <BlockedBadge blocked={device.blocked} />
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onBlock(device.mac)}
                          disabled={device.blocked}
                          className="bg-rose-500/8 hover:bg-rose-500/15 disabled:opacity-30 text-rose-400/80 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                        >
                          Bloquear
                        </button>
                        <button
                          onClick={() => onUnblock(device.mac)}
                          disabled={!device.blocked}
                          className="bg-emerald-500/8 hover:bg-emerald-500/15 disabled:opacity-30 text-emerald-400/80 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                        >
                          Desbloquear
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${device.mac}-expanded`} className="border-t border-white/[0.06]">
                      <td colSpan={10} className="p-0">
                        <ExpandedRow device={device} />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}