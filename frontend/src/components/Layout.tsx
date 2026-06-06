import type { ReactNode } from "react";

interface LayoutProps {
  currentTab: "dashboard" | "config";
  onTabChange: (tab: "dashboard" | "config") => void;
  children: ReactNode;
}

export function Layout({ currentTab, onTabChange, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/[0.08] bg-white/[0.04] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Router Guest Manager</h1>
              <p className="text-sm text-white/40">Device Management Dashboard</p>
            </div>
            <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 border border-white/[0.08]">
              <button
                onClick={() => onTabChange("dashboard")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === "dashboard"
                    ? "bg-white/[0.10] text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onTabChange("config")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === "config"
                    ? "bg-white/[0.10] text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                Config
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">{children}</main>
    </div>
  );
}