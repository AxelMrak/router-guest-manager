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
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800 text-gray-300 uppercase text-xs font-medium tracking-wider">
              <th className="px-4 py-3 text-left">Alias</th>
              <th className="px-4 py-3 text-left">Hostname</th>
              <th className="px-4 py-3 text-left">MAC</th>
              <th className="px-4 py-3 text-left">IP</th>
              <th className="px-4 py-3 text-left">Interface</th>
              <th className="px-4 py-3 text-left">Guest</th>
              <th className="px-4 py-3 text-left">Connected</th>
              <th className="px-4 py-3 text-left">RSSI</th>
              <th className="px-4 py-3 text-left">Blocked</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-t border-gray-800">
                {[...Array(10)].map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-5 bg-gray-800 rounded animate-pulse" />
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
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-center py-12 text-gray-500">No devices found</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-800 text-gray-300 uppercase text-xs font-medium tracking-wider">
            <th className="px-4 py-3 text-left">Alias</th>
            <th className="px-4 py-3 text-left">Hostname</th>
            <th className="px-4 py-3 text-left">MAC</th>
            <th className="px-4 py-3 text-left">IP</th>
            <th className="px-4 py-3 text-left">Interface</th>
            <th className="px-4 py-3 text-left">Guest</th>
            <th className="px-4 py-3 text-left">Connected</th>
            <th className="px-4 py-3 text-left">RSSI</th>
            <th className="px-4 py-3 text-left">Blocked</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((device) => (
            <tr key={device.mac} className="border-t border-gray-800 hover:bg-gray-800/50 transition">
              <td className="px-4 py-3 text-sm text-gray-100">{device.alias || "—"}</td>
              <td className="px-4 py-3 text-sm text-gray-100">{device.hostname || "—"}</td>
              <td className="px-4 py-3 text-sm text-gray-300 font-mono">{device.mac}</td>
              <td className="px-4 py-3 text-sm text-gray-300 font-mono">{device.ip}</td>
              <td className="px-4 py-3 text-sm text-gray-400">{device.ifname}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    device.guest ? "bg-green-500/20 text-green-400" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {device.guest ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-300">{formatSeconds(device.seconds)}</td>
              <td className="px-4 py-3 text-sm text-gray-300">{device.rssi}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    device.blocked ? "bg-red-500/20 text-red-400" : "bg-gray-800 text-gray-400"
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
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-3 py-1 text-xs font-medium transition-colors"
                  >
                    Block
                  </button>
                  <button
                    onClick={() => onUnblock(device.mac)}
                    disabled={!device.blocked}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-3 py-1 text-xs font-medium transition-colors"
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