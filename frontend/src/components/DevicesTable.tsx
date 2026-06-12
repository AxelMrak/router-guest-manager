import { useState } from "react";
import type { DeviceInfo } from "../types";
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
import { cn } from "@/lib/utils";

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
      <Badge variant="outline">
        ⬡ Ethernet
      </Badge>
    );
  }
  if (device.is_5g) {
    return (
      <Badge variant="secondary">
        ⟳ 5 GHz
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      ⌂ 2.4 GHz
    </Badge>
  );
}

function StatusBadge({ online }: { online: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("w-2 h-2 rounded-full", online ? "bg-emerald-500" : "bg-muted")} />
      <span className={cn("text-xs font-medium", online ? "text-foreground" : "text-muted-foreground")}>
        {online ? "En línea" : "Desconectado"}
      </span>
    </span>
  );
}

function GuestBadge({ guest }: { guest: boolean }) {
  return (
    <Badge variant={guest ? "secondary" : "outline"}>
      {guest ? "Sí" : "No"}
    </Badge>
  );
}

function BlockedBadge({ blocked }: { blocked: boolean }) {
  return (
    <Badge variant={blocked ? "destructive" : "outline"}>
      {blocked ? "Sí" : "No"}
    </Badge>
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
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
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
      <span className="text-xs text-muted-foreground w-16">{label}</span>
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
    <tr>
      <td colSpan={10} className="bg-muted/30 border-b border-border p-0">
        <div className="grid grid-cols-4 gap-x-8 gap-y-3 px-4 py-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">MAC</p>
            <p className="text-sm text-foreground font-mono">{device.mac}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">IP</p>
            <p className="text-sm text-foreground font-mono">{device.ip}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Hostname</p>
            <p className="text-sm text-foreground">{device.hostname || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Interfaz</p>
            <p className="text-sm text-foreground">{device.ifname}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">TX Rate</p>
            <p className="text-sm text-foreground">{device.txrate} Mbps</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">RX Rate</p>
            <p className="text-sm text-foreground">{device.rxrate} Mbps</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">802.11k</p>
            <p className={cn("text-sm", device.support_11k ? "text-emerald-500" : "text-muted-foreground")}>
              {device.support_11k ? "✓" : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">802.11v</p>
            <p className={cn("text-sm", device.support_11v ? "text-emerald-500" : "text-muted-foreground")}>
              {device.support_11v ? "✓" : "—"}
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
}

function LoadingSkeleton() {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <Skeleton className="h-5 w-48" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {["Alias", "Tipo", "Invitado", "Conectado", "Subida", "Bajada", "Señal", "Bloqueado", "Acciones"].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              {[...Array(9)].map((_, j) => (
                <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
    return <LoadingSkeleton />;
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Filter Bar */}
      <div className="px-4 py-3 border-b border-border flex flex-col gap-2">
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
        <p className="text-xs text-muted-foreground">
          Mostrando {sorted.length} de {devices.length} dispositivos
        </p>
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">No se encontraron dispositivos</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-6"></TableHead>
              <TableHead>Alias</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Invitado</TableHead>
              <TableHead>Conectado</TableHead>
              <TableHead>Subida</TableHead>
              <TableHead>Bajada</TableHead>
              <TableHead>Señal</TableHead>
              <TableHead>Bloqueado</TableHead>
              <TableHead>Acciones</TableHead>
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
                      <span className={cn("text-muted-foreground text-xs transition-transform", isExpanded ? "rotate-90" : "")}>
                        ▸
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusBadge online={device.online} />
                        <span className="text-sm text-foreground">{device.alias || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ConnectionTypeBadge device={device} />
                    </TableCell>
                    <TableCell>
                      <GuestBadge guest={device.guest} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatSeconds(device.seconds)}</TableCell>
                    <TableCell>
                      <span className={cn("text-sm", device.up_speed > 0 ? "text-emerald-500" : "text-muted-foreground")}>
                        ↑ {formatSpeed(device.up_speed)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-sm", device.down_speed > 0 ? "text-emerald-500" : "text-muted-foreground")}>
                        ↓ {formatSpeed(device.down_speed)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{device.rssi}</TableCell>
                    <TableCell>
                      <BlockedBadge blocked={device.blocked} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onBlock(device.mac)}
                          disabled={device.blocked}
                        >
                          Bloquear
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUnblock(device.mac)}
                          disabled={!device.blocked}
                        >
                          Desbloquear
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <ExpandedRow key={`${device.mac}-expanded`} device={device} />
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}