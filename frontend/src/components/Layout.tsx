import type { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "guests" | "config";

interface LayoutProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: ReactNode;
}

export function Layout({ currentTab, onTabChange, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Administrador de Invitados</h1>
              <p className="text-sm text-muted-foreground">Panel de Gestión de Dispositivos</p>
            </div>
            <Tabs value={currentTab} onValueChange={(v) => onTabChange(v as Tab)}>
              <TabsList variant="line">
                <TabsTrigger value="dashboard">Panel</TabsTrigger>
                <TabsTrigger value="guests">Invitados</TabsTrigger>
                <TabsTrigger value="config">Configuración</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">{children}</main>
    </div>
  );
}