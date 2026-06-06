import type { DeviceInfo } from "../types";

interface DevicesTableProps {
  devices: DeviceInfo[];
  onBlock: (mac: string) => void;
  onUnblock: (mac: string) => void;
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

export function DevicesTable({ devices, onBlock, onUnblock, isLoading }: DevicesTableProps) {
  const sorted = [...devices].sort((a, b) => {
    if (a.guest !== b.guest) return a.guest ? -1 : 1;
    return b.seconds - a.seconds;
  });

  if (isLoading) {
    return (
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Alias", "Hostname", "MAC", "IP", "Interface", "Guest", "Connected", "RSSI", "Blocked", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left uppercase tracking-wide text-xs text-white/40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-t border-white/[0.06]">
                {[...Array(10)].map((_, j) => (
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

  if (sorted.length === 0) {
    return (
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-center py-12 text-white/30">No devices found</div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {["Alias", "Hostname", "MAC", "IP", "Interface", "Guest", "Connected", "RSSI", "Blocked", "Actions"].map((h) => (
              <th key={h} className="px-4 py-3 text-left uppercase tracking-wide text-xs text-white/40 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((device) => (
            <tr key={device.mac} className="border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-3 text-sm text-white/70">{device.alias || "—"}</td>
              <td className="px-4 py-3 text-sm text-white/70">{device.hostname || "—"}</td>
              <td className="px-4 py-3 text-sm text-white/50 font-mono">{device.mac}</td>
              <td className="px-4 py-3 text-sm text-white/50 font-mono">{device.ip}</td>
              <td className="px-4 py-3 text-sm text-white/40">{device.ifname}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    device.guest ? "bg-green-500/10 text-green-400" : "bg-white/[0.08] text-white/40"
                  }`}
                >
                  {device.guest ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-white/50">{formatSeconds(device.seconds)}</td>
              <td className="px-4 py-3 text-sm text-white/50">{device.rssi}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    device.blocked ? "bg-red-500/10 text-red-400" : "bg-white/[0.08] text-white/40"
                  }`}
                >
                  {device.blocked ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onBlock(device.mac)}
                    disabled={device.blocked}
                    className="bg-red-500/15 hover:bg-red-500/25 disabled:opacity-30 text-red-400 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                  >
                    Block
                  </button>
                  <button
                    onClick={() => onUnblock(device.mac)}
                    disabled={!device.blocked}
                    className="bg-green-500/15 hover:bg-green-500/25 disabled:opacity-30 text-green-400 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                  >
                    Unblock
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}