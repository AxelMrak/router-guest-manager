import { useState } from "react";
import { Layout } from "./components/Layout";
import { SummaryCards } from "./components/SummaryCards";
import { DevicesTable } from "./components/DevicesTable";
import { ConfigPage } from "./components/ConfigPage";
import { useDevices, useBlockDevice, useUnblockDevice, useConfig, useUpdateConfig } from "./hooks/useApi";

export function App() {
  const [tab, setTab] = useState<"dashboard" | "config">("dashboard");
  const { data: devices, isLoading, error } = useDevices();
  const block = useBlockDevice();
  const unblock = useUnblockDevice();
  const { data: config, isLoading: configLoading } = useConfig();
  const updateConfig = useUpdateConfig();

  return (
    <Layout currentTab={tab} onTabChange={setTab}>
      {tab === "dashboard" ? (
        <>
          <SummaryCards devices={devices ?? []} />
          <DevicesTable
            devices={devices ?? []}
            onBlock={(mac) => block.mutate(mac)}
            onUnblock={(mac) => unblock.mutate(mac)}
            isLoading={isLoading}
          />
        </>
      ) : (
        <ConfigPage
          config={config}
          onUpdate={(cfg) => updateConfig.mutate(cfg)}
          isLoading={configLoading}
          isSaving={updateConfig.isPending}
        />
      )}
    </Layout>
  );
}