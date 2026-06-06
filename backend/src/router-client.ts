import type {
  UbosRequest,
  UbosResponse,
  SessionResult,
  HostEntry,
  HostInfoResult,
  DeviceDetail,
  BlackListEntry,
  BlackListResult,
  SetBlackParams,
} from "./types.js";

const UBUS_URL = "http://192.168.0.1/ubus";
const CREDENTIALS = { username: "useradmin", password: "REDACTED" };
const REQUEST_ID = 1;

export class RouterClient {
  private sessionToken: string | null = null;

  constructor(private readonly url: string = UBUS_URL) {}

  async login(username: string, password: string): Promise<string> {
    const request: UbosRequest = {
      jsonrpc: "2.0",
      id: REQUEST_ID,
      method: "call",
      params: ["00000000000000000000000000000000", "session", "login", { username, password }],
    };

    const response = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    const data: UbosResponse<SessionResult> = await response.json();

    if (data.error) {
      throw new Error(`Login failed: ${data.error.message}`);
    }

    if (!data.result || data.result[0] !== 0) {
      throw new Error(`Login failed with code: ${data.result?.[0]}`);
    }

    this.sessionToken = data.result[1].ubus_rpc_session;
    return this.sessionToken;
  }

  private async ensureSession(): Promise<string> {
    if (!this.sessionToken) {
      await this.login(CREDENTIALS.username, CREDENTIALS.password);
    }
    return this.sessionToken!;
  }

  async call<T>(object: string, method: string, params: Record<string, unknown> | undefined = {}): Promise<T> {
    const session = await this.ensureSession();

    const request: UbosRequest = {
      jsonrpc: "2.0",
      id: REQUEST_ID,
      method: "call",
      params: [session, object, method, params],
    };

    const response = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    const data: UbosResponse<T> = await response.json();

    // If unauthorized, re-login and retry once
    if (data.error && (data.error.code === -32002 || data.error.code === -32003)) {
      this.sessionToken = null;
      const newSession = await this.ensureSession();

      const retryRequest: UbosRequest = {
        jsonrpc: "2.0",
        id: REQUEST_ID,
        method: "call",
        params: [newSession, object, method, params],
      };

      const retryResponse = await fetch(this.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(retryRequest),
      });

      const retryData: UbosResponse<T> = await retryResponse.json();

      if (retryData.error) {
        throw new Error(`UBUS call failed: ${retryData.error.message}`);
      }

      if (!retryData.result || retryData.result[0] !== 0) {
        throw new Error(`UBUS call failed with code: ${retryData.result?.[0]}`);
      }

      return retryData.result[1];
    }

    if (data.error) {
      throw new Error(`UBUS call failed: ${data.error.message}`);
    }

    if (!data.result || data.result[0] !== 0) {
      throw new Error(`UBUS call failed with code: ${data.result?.[0]}`);
    }

    return data.result[1];
  }

  async getDevices(): Promise<HostEntry[]> {
    const result = await this.call<HostInfoResult>("devices_app", "get_host_info", {});
    return result.hosts;
  }

  async getDeviceDetail(mac: string): Promise<DeviceDetail> {
    const result = await this.call<DeviceDetail>("devices_app", "show", { mac });
    return result;
  }

  async getBlacklist(): Promise<BlackListEntry[]> {
    const result = await this.call<BlackListResult>("devices_app", "get_black_list", {});
    return result.blacklist;
  }

  async blockDevice(mac: string): Promise<void> {
    const params: SetBlackParams = {
      mac,
      enable: true,
      forbid_internet: true,
    };
    await this.call("devices_app", "set_black", params as unknown as Record<string, unknown>);
  }

  async unblockDevice(mac: string): Promise<void> {
    const params: SetBlackParams = {
      mac,
      enable: false,
      forbid_internet: false,
    };
    await this.call("devices_app", "set_black", params as unknown as Record<string, unknown>);
  }
}