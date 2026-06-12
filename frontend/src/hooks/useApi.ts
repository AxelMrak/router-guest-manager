import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";

export function useDevices() {
  return useQuery({ queryKey: ["devices"], queryFn: api.fetchDevices, refetchInterval: 10000 });
}

export function useBlockDevice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.blockDevice, onSuccess: () => qc.invalidateQueries({ queryKey: ["devices"] }) });
}

export function useUnblockDevice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.unblockDevice, onSuccess: () => qc.invalidateQueries({ queryKey: ["devices"] }) });
}

export function useConfig() {
  return useQuery({ queryKey: ["config"], queryFn: api.fetchConfig });
}

export function useUpdateConfig() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.updateConfig, onSuccess: () => qc.invalidateQueries({ queryKey: ["config"] }) });
}

export function useGuests() {
  return useQuery({ queryKey: ["guests"], queryFn: api.fetchGuests, refetchInterval: 10000 });
}

export function useGuestMetrics() {
  return useQuery({ queryKey: ["guestMetrics"], queryFn: api.fetchGuestMetrics, refetchInterval: 5000 });
}

export function useSetGuestTimer() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (args: { mac: string; minutes: number }) => api.setGuestTimer(args.mac, args.minutes), onSuccess: () => { qc.invalidateQueries({ queryKey: ["guests"] }); qc.invalidateQueries({ queryKey: ["guestMetrics"] }); } });
}

export function useRemoveGuestTimer() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: api.removeGuestTimer, onSuccess: () => { qc.invalidateQueries({ queryKey: ["guests"] }); qc.invalidateQueries({ queryKey: ["guestMetrics"] }); } });
}