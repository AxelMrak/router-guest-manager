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
}

export interface AppConfig {
  guestInterfaces: string[];
  maxMinutes: number;
  autoBlockEnabled: boolean;
  pollIntervalSeconds: number;
}
