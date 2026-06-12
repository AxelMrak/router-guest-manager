export interface DeviceInfo {
  alias: string;
  hostname: string;
  mac: string;
  ip: string;
  ifname: string;
  guest: boolean;
  blocked: boolean;
  seconds: number;
  rssi: number;
  online: boolean;
  up_speed: number;
  down_speed: number;
  txrate: number;
  rxrate: number;
  is_5g: boolean;
  is_wifi: boolean;
  support_11k: boolean;
  support_11v: boolean;
}

export interface AppConfig {
  maxMinutes: number;
  autoBlockEnabled: boolean;
  pollIntervalSeconds: number;
  guestTimerEnabled: boolean;
  guestTimerMinutes: number;
}

export interface GuestDeviceInfo extends DeviceInfo {
  connectedAt: number;
  timerMinutes: number | null;
  timerExpiresAt: number | null;
}

export interface GuestMetrics {
  totalGuests: number;
  onlineGuests: number;
  blockedGuests: number;
  totalUpSpeed: number;
  totalDownSpeed: number;
  timerEnabled: boolean;
  timerMinutes: number;
  timerActiveCount: number;
}
