import type { DeviceInfo } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SummaryCardsProps {
  devices: DeviceInfo[];
}

const cards = [
  { label: "Total", value: (d: DeviceInfo[]) => d.length, variant: "default" as const },
  { label: "En línea", value: (d: DeviceInfo[]) => d.filter((x) => x.online).length, variant: "secondary" as const },
  { label: "Invitados", value: (d: DeviceInfo[]) => d.filter((x) => x.guest).length, variant: "outline" as const },
  { label: "Bloqueados", value: (d: DeviceInfo[]) => d.filter((x) => x.blocked).length, variant: "destructive" as const },
];

export function SummaryCards({ devices }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-6">
            <p className="text-4xl font-semibold text-foreground">{card.value(devices)}</p>
            <p className="text-sm text-muted-foreground mt-2">{card.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}