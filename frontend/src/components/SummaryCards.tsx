import type { DeviceInfo } from "../types";

interface SummaryCardsProps {
  devices: DeviceInfo[];
}

const cards = [
  { label: "Total", value: (d: DeviceInfo[]) => d.length, color: "text-white" },
  { label: "En línea", value: (d: DeviceInfo[]) => d.filter((x) => x.online).length, color: "text-emerald-400" },
  { label: "Invitados", value: (d: DeviceInfo[]) => d.filter((x) => x.guest).length, color: "text-sky-400" },
  { label: "Bloqueados", value: (d: DeviceInfo[]) => d.filter((x) => x.blocked).length, color: "text-rose-400" },
];

export function SummaryCards({ devices }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="card-enter bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 opacity-0"
        >
          <p className={`text-4xl font-semibold ${card.color}`}>{card.value(devices)}</p>
          <p className="text-sm text-white/40 mt-2">{card.label}</p>
        </div>
      ))}
    </div>
  );
}