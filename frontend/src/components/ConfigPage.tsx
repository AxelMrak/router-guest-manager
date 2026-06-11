import { useState, useEffect } from "react";
import type { AppConfig } from "../types";

interface ConfigPageProps {
  config: AppConfig | undefined;
  onUpdate: (config: Partial<AppConfig>) => void;
  isLoading: boolean;
  isSaving: boolean;
}

export function ConfigPage({ config, onUpdate, isLoading, isSaving }: ConfigPageProps) {
  const [local, setLocal] = useState<AppConfig>({
    maxMinutes: 20,
    autoBlockEnabled: true,
    pollIntervalSeconds: 60,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) setLocal({ ...config });
  }, [config]);

  const handleSave = () => {
    onUpdate(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 space-y-5">
        <div className="h-6 bg-white/[0.06] rounded animate-pulse w-40" />
        <div className="h-10 bg-white/[0.06] rounded animate-pulse" />
        <div className="h-10 bg-white/[0.06] rounded animate-pulse" />
        <div className="h-10 bg-white/[0.06] rounded animate-pulse w-28" />
      </div>
    );
  }

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 space-y-6">
      <h2 className="text-lg font-semibold text-white">Configuración</h2>

      {/* Auto Block Toggle */}
      <div className="flex items-center justify-between">
        <label htmlFor="autoBlock" className="text-sm text-white/70">
          Bloqueo Automático
        </label>
        <button
          id="autoBlock"
          type="button"
          onClick={() => setLocal((prev) => ({ ...prev, autoBlockEnabled: !prev.autoBlockEnabled }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            local.autoBlockEnabled ? "bg-sky-500/40" : "bg-white/[0.15]"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
              local.autoBlockEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Max Minutes */}
      <div>
        <label htmlFor="maxMinutes" className="block text-sm text-white/70 mb-2">
          Minutos Máximos
        </label>
        <input
          id="maxMinutes"
          type="number"
          value={local.maxMinutes}
          onChange={(e) => setLocal((prev) => ({ ...prev, maxMinutes: parseInt(e.target.value) || 0 }))}
          className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2 text-white placeholder:text-white/20 focus:border-sky-400/50 focus:ring-0"
        />
      </div>

      {/* Poll Interval */}
      <div>
        <label htmlFor="pollInterval" className="block text-sm text-white/70 mb-2">
          Intervalo de Sondeo (segundos)
        </label>
        <input
          id="pollInterval"
          type="number"
          min="5"
          value={local.pollIntervalSeconds}
          onChange={(e) =>
            setLocal((prev) => ({ ...prev, pollIntervalSeconds: Math.max(5, parseInt(e.target.value) || 5) }))
          }
          className="w-full bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-2 text-white placeholder:text-white/20 focus:border-sky-400/50 focus:ring-0"
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-sky-500/20 hover:bg-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sky-400/80 rounded-lg px-5 py-2 text-sm font-medium transition-colors border border-sky-500/20"
        >
          {isSaving ? "Guardando..." : "Guardar"}
        </button>
        <span
          className={`text-sm text-emerald-400/80 saved-fade ${saved ? "opacity-100" : "opacity-0"}`}
        >
          ¡Guardado!
        </span>
      </div>
    </div>
  );
}