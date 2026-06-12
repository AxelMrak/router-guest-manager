import type { ReactNode } from "react";

type Tab = "dashboard" | "guests" | "config";

interface LayoutProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: ReactNode;
}

export function Layout({ currentTab, onTabChange, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/[0.08] bg-white/[0.04] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Administrador de Invitados</h1>
              <p className="text-sm text-white/40">Panel de Gestión de Dispositivos</p>
            </div>
            <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 border border-white/[0.08]">
              {(["dashboard", "guests", "config"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onTabChange(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentTab === t
                      ? "bg-white/[0.10] text-white"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {t === "dashboard" ? "Panel" : t === "guests" ? "Invitados" : "Configuración"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">{children}</main>
    </div>
  );
}