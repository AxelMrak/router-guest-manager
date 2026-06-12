import { useState } from "react";
import type { GuestMetrics } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GuestMetricsBarProps {
  metrics: GuestMetrics | undefined;
  isLoading: boolean;
}

function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec < 1024) return `${bytesPerSec} B/s`;
  if (bytesPerSec < 1048576) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
  return `${(bytesPerSec / 1048576).toFixed(1)} MB/s`;
}

export function GuestMetricsBar({ metrics, isLoading }: GuestMetricsBarProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-5">
              <div className="h-3 w-20 bg-muted rounded mb-3 animate-pulse" />
              <div className="h-7 w-16 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { totalGuests, onlineGuests, blockedGuests, totalUpSpeed, totalDownSpeed, timerEnabled, timerMinutes, timerActiveCount } = metrics;

  const bandwidthTotal = totalUpSpeed + totalDownSpeed;
  const maxBandwidth = timerEnabled ? timerMinutes * 10240 : 102400;
  const bandwidthPercent = Math.min(100, (bandwidthTotal / maxBandwidth) * 100);

  const textColor = bandwidthPercent < 50 ? "text-emerald-500" : bandwidthPercent < 80 ? "text-amber-500" : "text-destructive";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground mb-1">Invitados</p>
            <p className="text-3xl font-semibold text-foreground">
              {onlineGuests}
              <span className="text-lg text-muted-foreground ml-1">/ {totalGuests}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground mb-1">Bloqueados</p>
            <p className="text-3xl font-semibold text-destructive">{blockedGuests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground mb-1">Consumo</p>
            <p className="text-3xl font-semibold text-foreground">
              {formatSpeed(totalDownSpeed)}
              <span className="text-lg text-emerald-500 ml-1">↓</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatSpeed(totalUpSpeed)} ↑
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground mb-1">Timer</p>
            <p className="text-3xl font-semibold text-foreground">
              {timerEnabled ? `${timerMinutes}m` : "Off"}
              {timerEnabled && <span className="text-lg text-muted-foreground ml-1">{timerActiveCount} act.</span>}
            </p>
          </CardContent>
        </Card>
      </div>

      {timerEnabled && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Consumo de invitados</span>
              <span className={cn("text-sm font-medium", textColor)}>{bandwidthPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", textColor)}
                style={{ width: `${bandwidthPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatSpeed(bandwidthTotal)} total · Límite de referencia: ~{formatSpeed(maxBandwidth)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}