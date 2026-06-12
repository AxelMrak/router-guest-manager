import type { DeviceInfo, AppConfig, GuestDeviceInfo, GuestMetrics } from "./types";

export async function fetchDevices(): Promise<DeviceInfo[]> {
  const res = await fetch("/api/devices");
  if (!res.ok) throw new Error("Failed to fetch devices");
  return res.json();
}

export async function blockDevice(mac: string): Promise<void> {
  const res = await fetch(`/api/devices/${encodeURIComponent(mac)}/block`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to block device");
}

export async function unblockDevice(mac: string): Promise<void> {
  const res = await fetch(`/api/devices/${encodeURIComponent(mac)}/unblock`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to unblock device");
}

export async function fetchConfig(): Promise<AppConfig> {
  const res = await fetch("/api/config");
  if (!res.ok) throw new Error("Failed to fetch config");
  return res.json();
}

export async function updateConfig(config: Partial<AppConfig>): Promise<AppConfig> {
  const res = await fetch("/api/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error("Failed to update config");
  return res.json();
}

export async function fetchGuests(): Promise<GuestDeviceInfo[]> {
  const res = await fetch("/api/guests");
  if (!res.ok) throw new Error("Failed to fetch guests");
  return res.json();
}

export async function fetchGuestMetrics(): Promise<GuestMetrics> {
  const res = await fetch("/api/guests/metrics");
  if (!res.ok) throw new Error("Failed to fetch guest metrics");
  return res.json();
}

export async function setGuestTimer(mac: string, minutes: number): Promise<void> {
  const res = await fetch(`/api/guests/${encodeURIComponent(mac)}/timer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ minutes }),
  });
  if (!res.ok) throw new Error("Failed to set guest timer");
}

export async function removeGuestTimer(mac: string): Promise<void> {
  const res = await fetch(`/api/guests/${encodeURIComponent(mac)}/timer`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove guest timer");
}