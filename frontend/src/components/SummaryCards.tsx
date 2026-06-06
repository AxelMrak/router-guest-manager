import type { DeviceInfo } from "../types";

interface SummaryCardsProps {
  devices: DeviceInfo[];
}

const cards = [
  { label: "Total Devices", value: (d: DeviceInfo[]) => d.length, color: "text-cyan-400" },
  { label: "Online", value: (d: DeviceInfo[]) => d.filter((x) => x.online).length, color: "text-green-400" },
  { label: "Guest", value: (d: DeviceInfo[]) => d.filter((x) => x.guest).length, color: "text-amber-400" },
  { label: "Blocked", value: (d: DeviceInfo[]) => d.filter((x) => x.blocked).length, color: "text-red-400" },
];

export function SummaryCards({ devices }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className={`text-3xl font-bold ${card.color}`}>{card.value(devices)}</p>
          <p className="text-sm text-gray-400 mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  );
}