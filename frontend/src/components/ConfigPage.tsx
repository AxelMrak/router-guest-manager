import { useState, useEffect } from "react";
import type { AppConfig } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    guestTimerEnabled: false,
    guestTimerMinutes: 30,
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
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="h-6 bg-muted rounded animate-pulse w-40" />
          <div className="h-10 bg-muted rounded animate-pulse" />
          <div className="h-10 bg-muted rounded animate-pulse" />
          <div className="h-10 bg-muted rounded animate-pulse w-28" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto Block Toggle */}
        <div className="flex items-center justify-between">
          <label htmlFor="autoBlock" className="text-sm text-foreground">
            Bloqueo Automático
          </label>
          <Switch
            id="autoBlock"
            checked={local.autoBlockEnabled}
            onCheckedChange={(checked) => setLocal((prev) => ({ ...prev, autoBlockEnabled: checked }))}
          />
        </div>

        {/* Max Minutes */}
        <div>
          <label htmlFor="maxMinutes" className="block text-sm text-foreground mb-2">
            Minutos Máximos
          </label>
          <Input
            id="maxMinutes"
            type="number"
            value={local.maxMinutes}
            onChange={(e) => setLocal((prev) => ({ ...prev, maxMinutes: parseInt(e.target.value) || 0 }))}
          />
        </div>

        {/* Poll Interval */}
        <div>
          <label htmlFor="pollInterval" className="block text-sm text-foreground mb-2">
            Intervalo de Sondeo (segundos)
          </label>
          <Input
            id="pollInterval"
            type="number"
            min="5"
            value={local.pollIntervalSeconds}
            onChange={(e) =>
              setLocal((prev) => ({ ...prev, pollIntervalSeconds: Math.max(5, parseInt(e.target.value) || 5) }))
            }
          />
        </div>

        {/* Guest Timer Section */}
        <div className="pt-6 border-t border-border space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Timer de Invitados</h3>

          <div className="flex items-center justify-between">
            <label htmlFor="guestTimerEnabled" className="text-sm text-foreground">
              Bloqueo Automático de Invitados
            </label>
            <Switch
              id="guestTimerEnabled"
              checked={local.guestTimerEnabled}
              onCheckedChange={(checked) => setLocal((prev) => ({ ...prev, guestTimerEnabled: checked }))}
            />
          </div>

          <div>
            <label htmlFor="guestTimerMinutes" className="block text-sm text-foreground mb-2">
              Tiempo máximo para invitados (minutos)
            </label>
            <Input
              id="guestTimerMinutes"
              type="number"
              min="1"
              value={local.guestTimerMinutes}
              onChange={(e) => setLocal((prev) => ({ ...prev, guestTimerMinutes: Math.max(1, parseInt(e.target.value) || 1) }))}
              disabled={!local.guestTimerEnabled}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
          <span className={cn("text-sm text-emerald-500 transition-opacity", saved ? "opacity-100" : "opacity-0")}>
            ¡Guardado!
          </span>
        </div>
      </CardContent>
    </Card>
  );
}