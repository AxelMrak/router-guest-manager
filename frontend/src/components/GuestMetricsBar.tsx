import type { GuestMetrics } from "../types";

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
          <div key={i} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 animate-pulse">
            <div className="h-3 w-20 bg-white/10 rounded mb-3" />
            <div className="h-7 w-16 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const { totalGuests, onlineGuests, blockedGuests, totalUpSpeed, totalDownSpeed, timerEnabled, timerMinutes, timerActiveCount } = metrics;

  const bandwidthTotal = totalUpSpeed + totalDownSpeed;
  const maxBandwidth = timerEnabled ? timerMinutes * 10240 : 102400;
  const bandwidthPercent = Math.min(100, (bandwidthTotal / maxBandwidth) * 100);

  const progressColor =
    bandwidthPercent < 50 ? "bg-emerald-500" :
    bandwidthPercent < 80 ? "bg-amber-500" :
    "bg-rose-500";

  const textColor =
    bandwidthPercent < 50 ? "text-emerald-400" :
    bandwidthPercent < 80 ? "text-amber-400" :
    "text-rose-400";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 card-enter" style={{ animationDelay: "0ms" }}>
          <p className="text-sm text-white/40 mb-1">Invitados</p>
          <p className="text-3xl font-semibold text-sky-400">{onlineGuests}<span className="text-lg text-white/20 ml-1">/ {totalGuests}</span></p>
        </div>
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 card-enter" style={{ animationDelay: "50ms" }}>
          <p className="text-sm text-white/40 mb-1">Bloqueados</p>
          <p className="text-3xl font-semibold text-rose-400">{blockedGuests}</p>
        </div>
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 card-enter" style={{ animationDelay: "100ms" }}>
          <p className="text-sm text-white/40 mb-1">Consumo</p>
          <p className="text-3xl font-semibold text-white">
            {formatSpeed(totalDownSpeed)}
            <span className="text-lg text-emerald-400/60 ml-1">↓</span>
          </p>
          <p className="text-xs text-white/30 mt-1">
            {formatSpeed(totalUpSpeed)} ↑
          </p>
        </div>
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 card-enter" style={{ animationDelay: "150ms" }}>
          <p className="text-sm text-white/40 mb-1">Timer</p>
          <p className="text-3xl font-semibold text-white">
            {timerEnabled ? `${timerMinutes}m` : "Off"}
            {timerEnabled && <span className="text-lg text-white/20 ml-1">{timerActiveCount} act.</span>}
          </p>
        </div>
      </div>

      {timerEnabled && (
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/40">Consumo de invitados</span>
            <span className={`text-sm font-medium ${textColor}`}>{bandwidthPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${bandwidthPercent}%` }}
            />
          </div>
          <p className="text-xs text-white/25 mt-2">
            {formatSpeed(bandwidthTotal)} total · Límite de referencia: ~{formatSpeed(maxBandwidth)}
          </p>
        </div>
      )}
    </div>
  );
}
