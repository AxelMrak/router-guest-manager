import { GuestMetricsBar } from "./GuestMetricsBar";
import { GuestsTable } from "./GuestsTable";
import { useGuests, useGuestMetrics, useBlockDevice, useUnblockDevice, useSetGuestTimer, useRemoveGuestTimer } from "../hooks/useApi";

export function GuestsPage() {
  const { data: guests, isLoading: guestsLoading } = useGuests();
  const { data: metrics, isLoading: metricsLoading } = useGuestMetrics();
  const block = useBlockDevice();
  const unblock = useUnblockDevice();
  const setTimer = useSetGuestTimer();
  const removeTimer = useRemoveGuestTimer();

  return (
    <>
      <GuestMetricsBar metrics={metrics} isLoading={metricsLoading} />
      <GuestsTable
        guests={guests ?? []}
        onBlock={(mac) => block.mutate(mac)}
        onUnblock={(mac) => unblock.mutate(mac)}
        onSetTimer={(mac, minutes) => setTimer.mutate({ mac, minutes })}
        onRemoveTimer={(mac) => removeTimer.mutate(mac)}
        isLoading={guestsLoading}
      />
    </>
  );
}
