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
    guestInterfaces: [],
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
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <div className="h-6 bg-gray-800 rounded animate-pulse w-32" />
        <div className="h-10 bg-gray-800 rounded animate-pulse" />
        <div className="h-10 bg-gray-800 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-gray-800 rounded animate-pulse" />
          <div className="h-10 bg-gray-800 rounded animate-pulse" />
          <div className="h-10 bg-gray-800 rounded animate-pulse" />
          <div className="h-10 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="h-10 bg-gray-800 rounded animate-pulse w-24" />
      </div>
    );
  }

  const toggleInterface = (iface: string) => {
    setLocal((prev) => ({
      ...prev,
      guestInterfaces: prev.guestInterfaces.includes(iface)
        ? prev.guestInterfaces.filter((i) => i !== iface)
        : [...prev.guestInterfaces, iface],
    }));
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
      <h2 className="text-lg font-semibold text-white">Configuration</h2>

      {/* Auto Block Toggle */}
      <div className="flex items-center justify-between">
        <label htmlFor="autoBlock" className="text-sm text-gray-300">
          Auto Block
        </label>
        <button
          id="autoBlock"
          type="button"
          onClick={() => setLocal((prev) => ({ ...prev, autoBlockEnabled: !prev.autoBlockEnabled }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            local.autoBlockEnabled ? "bg-cyan-500" : "bg-gray-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              local.autoBlockEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Max Minutes */}
      <div>
        <label htmlFor="maxMinutes" className="block text-sm text-gray-300 mb-1">
          Max Minutes
        </label>
        <input
          id="maxMinutes"
          type="number"
          value={local.maxMinutes}
          onChange={(e) => setLocal((prev) => ({ ...prev, maxMinutes: parseInt(e.target.value) || 0 }))}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Poll Interval */}
      <div>
        <label htmlFor="pollInterval" className="block text-sm text-gray-300 mb-1">
          Poll Interval (seconds)
        </label>
        <input
          id="pollInterval"
          type="number"
          min="5"
          value={local.pollIntervalSeconds}
          onChange={(e) =>
            setLocal((prev) => ({ ...prev, pollIntervalSeconds: Math.max(5, parseInt(e.target.value) || 5) }))
          }
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Guest Interfaces */}
      <div>
        <p className="text-sm text-gray-300 mb-2">Guest Interfaces</p>
        <div className="grid grid-cols-2 gap-3">
          {["ra1", "ra2", "rax1", "rax2"].map((iface) => (
            <label key={iface} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={local.guestInterfaces.includes(iface)}
                onChange={() => toggleInterface(iface)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-300">{iface}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 font-medium transition-colors"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        {saved && <span className="text-sm text-green-400">Saved!</span>}
      </div>
    </div>
  );
}