import { useState } from "react";
import type { GuestDeviceInfo } from "../types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

  if (!device.online) return <span className="text-xs text-muted-foreground">—</span>;

  if (device.timerMinutes && device.timerExpiresAt) {
    const now = Math.floor(Date.now() / 1000);
    const remaining = device.timerExpiresAt - now;
    const isExpired = remaining <= 0;
    const color = isExpired ? "text-destructive" : remaining < 300 ? "text-amber-500" : "text-emerald-500";

    return (
      <div className="flex items-center gap-2">
        <span className={cn("text-xs font-medium", color)}>
          {isExpired ? "Expirado" : formatSeconds(Math.max(0, remaining))}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(device.mac); }}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
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
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min="1"
          className="w-12 h-6 text-xs text-center"
        />
        <span className="text-xs text-muted-foreground">min</span>
        <button type="submit" className="text-xs text-emerald-500 hover:text-emerald-400 ml-1">✓</button>
        <button type="button" onClick={() => setEditing(false)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
      </form>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
    >
      ⏱ Timer
    </Button>
  );
}

function ExpandedRow({ device }: { device: GuestDeviceInfo }) {
  return (
    <tr>
      <td colSpan={8} className="bg-muted/30 border-b border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 text-sm">
          <div><span className="text-muted-foreground">MAC:</span> <span className="text-foreground ml-2 font-mono text-xs">{device.mac}</span></div>
          <div><span className="text-muted-foreground">IP:</span> <span className="text-foreground ml-2">{device.ip}</span></div>
          <div><span className="text-muted-foreground">Hostname:</span> <span className="text-foreground ml-2">{device.hostname || "—"}</span></div>
          <div><span className="text-muted-foreground">Interfaz:</span> <span className="text-foreground ml-2 font-mono text-xs">{device.ifname}</span></div>
          <div><span className="text-muted-foreground">TX Rate:</span> <span className="text-foreground ml-2">{device.txrate > 0 ? `${device.txrate} Mbps` : "—"}</span></div>
          <div><span className="text-muted-foreground">RX Rate:</span> <span className="text-foreground ml-2">{device.rxrate > 0 ? `${device.rxrate} Mbps` : "—"}</span></div>
          <div><span className="text-muted-foreground">802.11k:</span> <span className={cn("ml-2", device.support_11k ? "text-emerald-500" : "text-muted-foreground")}>{device.support_11k ? "Sí" : "No"}</span></div>
          <div><span className="text-muted-foreground">802.11v:</span> <span className={cn("ml-2", device.support_11v ? "text-emerald-500" : "text-muted-foreground")}>{device.support_11v ? "Sí" : "No"}</span></div>
          {device.connectedAt > 0 && (
            <div className="col-span-2"><span className="text-muted-foreground">Conectado desde:</span> <span className="text-foreground ml-2">{new Date(device.connectedAt * 1000).toLocaleString()}</span></div>
          )}
        </div>
      </td>
    </tr>
  );
}

function SkeletonRows() {
  return Array.from({ length: 3 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: 8 }).map((_, j) => (
        <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>
      ))}
    </TableRow>
  ));
}

export function GuestsTable({ guests, onBlock, onUnblock, onSetTimer, onRemoveTimer, isLoading }: GuestsTableProps) {
  const [expandedMac, setExpandedMac] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {["Dispositivo", "Tipo", "Conectado", "Subida", "Bajada", "Señal", "Timer", "Acciones"].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody><SkeletonRows /></TableBody>
        </Table>
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div className="border border-border rounded-xl p-12 text-center">
        <p className="text-muted-foreground text-sm">No hay dispositivos invitados</p>
      </div>
    );
  }

  const sorted = [...guests].sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    return b.seconds - a.seconds;
  });

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {["Dispositivo", "Tipo", "Conectado", "Subida", "Bajada", "Señal", "Timer", "Acciones"].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((device) => {
            const isExpanded = expandedMac === device.mac;
            return (
              <>
                <TableRow
                  key={device.mac}
                  onClick={() => setExpandedMac(isExpanded ? null : device.mac)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn("transition-transform text-muted-foreground text-xs", isExpanded ? "rotate-90" : "")}>▸</span>
                      <div>
                        <p className="text-foreground text-sm font-medium">{device.alias || device.hostname || device.mac}</p>
                        {device.alias && device.hostname && <p className="text-muted-foreground text-xs">{device.hostname}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={!device.is_wifi ? "outline" : device.is_5g ? "secondary" : "outline"}>
                      {!device.is_wifi ? "⬡ Eth" : device.is_5g ? "⟳ 5G" : "⌂ 2.4G"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", device.online ? "bg-emerald-500" : "bg-muted")} />
                        <span className="text-muted-foreground text-xs">hace {formatSeconds(device.seconds)}</span>
                      </span>
                      {device.connectedAt > 0 && (
                        <span className="text-muted-foreground text-[10px] mt-0.5">{new Date(device.connectedAt * 1000).toLocaleTimeString()}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={device.up_speed > 0 ? "text-emerald-500" : "text-muted-foreground"}>
                      {formatSpeed(device.up_speed)} ↑
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={device.down_speed > 0 ? "text-emerald-500" : "text-muted-foreground"}>
                      {formatSpeed(device.down_speed)} ↓
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn("text-xs font-mono",
                      device.rssi > -60 ? "text-emerald-500" : device.rssi > -75 ? "text-amber-500" : "text-destructive"
                    )}>
                      {device.rssi} dBm
                    </span>
                  </TableCell>
                  <TableCell>
                    <TimerBadge device={device} onSet={onSetTimer} onRemove={onRemoveTimer} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {device.blocked ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUnblock(device.mac)}
                        >
                          Desbloquear
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onBlock(device.mac)}
                        >
                          Bloquear
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded && <ExpandedRow device={device} />}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}