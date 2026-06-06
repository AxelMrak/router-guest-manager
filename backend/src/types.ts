// ── UBUS JSON-RPC ──

export interface UbosRequest {
  jsonrpc: "2.0";
  id: number;
  method: "call";
  params: [string, string, string, Record<string, unknown>?];
}

export interface UbosResponse<T = unknown> {
  jsonrpc: "2.0";
  id: number;
  result?: [number, T];
  error?: { code: number; message: string };
}

// ── Auth ──

export interface SessionResult {
  ubus_rpc_session: string;
}

// ── Device (from get_host_info) ──

export interface HostEntry {
  alias: string;
  mac: string;
  ip: string;
  online: boolean;
  second: number;
  is_wifi: number;
  is_5g: number;
}

export interface HostInfoResult {
  hosts: HostEntry[];
}

// ── Device Details (from show) ──

export interface DeviceDetail {
  mac: string;
  alias: string;
  hostname: string;
  ip: string;
  ifname: string;
  is_black: boolean;
  forbid_internet: boolean;
  is_wifi: number;
  is_5g: number;
  second: number;
  rssi: number;
  txrate: number;
  rxrate: number;
  up_speed: number;
  down_speed: number;
  support_11k: boolean;
  support_11v: boolean;
  online: boolean;
}

// ── Blacklist ──

export interface BlackListEntry {
  mac: string;
  alias: string;
}

export interface BlackListResult {
  blacklist: BlackListEntry[];
}

// ── Block command params ──

export interface SetBlackParams {
  mac: string;
  enable: boolean;
  forbid_internet: boolean;
}

// ── Config ──

export interface AppConfig {
  guestInterfaces: string[];
  maxMinutes: number;
  autoBlockEnabled: boolean;
  pollIntervalSeconds: number;
}

export const DEFAULT_CONFIG: AppConfig = {
  guestInterfaces: ["ra2", "rax2"],
  maxMinutes: 20,
  autoBlockEnabled: true,
  pollIntervalSeconds: 60,
};

// ── Frontend-facing Device ──

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
