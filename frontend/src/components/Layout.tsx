import type { ReactNode } from "react";

interface LayoutProps {
  currentTab: "dashboard" | "config";
  onTabChange: (tab: "dashboard" | "config") => void;
  children: ReactNode;
}

export function Layout({ currentTab, onTabChange, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Router Guest Manager</h1>
              <p className="text-sm text-gray-400">Device Management Dashboard</p>
            </div>
            <div className="flex gap-1 bg-gray-900 rounded-lg p-1 border border-gray-800">
              <button
                onClick={() => onTabChange("dashboard")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentTab === "dashboard" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onTabChange("config")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentTab === "config" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Config
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">{children}</main>
    </div>
  );
}