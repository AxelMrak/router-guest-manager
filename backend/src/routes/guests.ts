import { Hono } from "hono";
import type { RouterClient } from "../router-client.js";
import type { ConfigManager } from "../config-manager.js";
import type { DeviceInfo, GuestDeviceInfo, GuestMetrics } from "../types.js";

const GUEST_INTERFACES = ["ra2", "rax2"];

type Variables = {
  routerClient: RouterClient;
  configManager: ConfigManager;
};

const perDeviceTimers = new Map<string, number>();

function guestDeviceInfo(device: DeviceInfo, config: { guestTimerEnabled: boolean; guestTimerMinutes: number }): GuestDeviceInfo {
  const perDeviceMinutes = perDeviceTimers.get(device.mac);
  const timerMinutes = perDeviceMinutes ?? (config.guestTimerEnabled ? config.guestTimerMinutes : null);

  return {
    ...device,
    connectedAt: Math.floor(Date.now() / 1000) - device.seconds,
    timerMinutes,
    timerExpiresAt: timerMinutes ? Math.floor(Date.now() / 1000) - device.seconds + timerMinutes * 60 : null,
  };
}

export function createGuestsRouter(routerClient: RouterClient, configManager: ConfigManager) {
  const app = new Hono<{ Variables: Variables }>();

  app.use("*", async (c, next) => {
    c.set("routerClient", routerClient);
    c.set("configManager", configManager);
    await next();
  });

  app.get("/", async (c) => {
    const client = c.get("routerClient");
    const config = configManager.getConfig();

    try {
      const hosts = await client.getDevices();
      const guestDevices = await Promise.all(
        hosts.map(async (host) => {
          try {
            const detail = await client.getDeviceDetail(host.mac);
            if (!GUEST_INTERFACES.includes(detail.ifname || "")) return null;

            const deviceInfo: DeviceInfo = {
              alias: detail.alias || host.alias || "",
              hostname: detail.hostname ?? "",
              mac: detail.mac || host.mac || "",
              ip: detail.ip || host.ip || "",
              ifname: detail.ifname || "",
              guest: true,
              blocked: detail.is_black || host.is_black || false,
              seconds: detail.second || host.second || 0,
              rssi: detail.rssi || 0,
              online: detail.online ?? host.online ?? false,
              up_speed: detail.up_speed || host.up_speed || 0,
              down_speed: detail.down_speed || host.down_speed || 0,
              txrate: detail.txrate || 0,
              rxrate: detail.rxrate || 0,
              is_5g: (detail.is_5g || host.is_5g) === 1,
              is_wifi: (detail.is_wifi || host.is_wifi) === 1,
              support_11k: detail.support_11k ?? false,
              support_11v: detail.support_11v ?? false,
            };

            return guestDeviceInfo(deviceInfo, config);
          } catch {
            return null;
          }
        })
      );

      const filtered = guestDevices.filter((d): d is GuestDeviceInfo => d !== null);
      return c.json(filtered);
    } catch (error) {
      console.error("Failed to get guest devices:", error);
      return c.json({ error: "Failed to get guest devices" }, 500);
    }
  });

  app.get("/metrics", async (c) => {
    const client = c.get("routerClient");
    const config = configManager.getConfig();

    try {
      const hosts = await client.getDevices();
      const now = Math.floor(Date.now() / 1000);

      const results = await Promise.all(
        hosts.map(async (host) => {
          try {
            const detail = await client.getDeviceDetail(host.mac);
            if (!GUEST_INTERFACES.includes(detail.ifname || "")) return null;

            const online = detail.online ?? host.online ?? false;
            const blocked = detail.is_black || host.is_black || false;
            const upSpeed = Number(detail.up_speed ?? host.up_speed ?? 0);
            const downSpeed = Number(detail.down_speed ?? host.down_speed ?? 0);
            const seconds = Number(detail.second ?? host.second ?? 0);

            let timerActive = false;
            if (config.guestTimerEnabled && online) {
              const connectedAt = now - seconds;
              const timerMinutes = perDeviceTimers.get(host.mac) ?? config.guestTimerMinutes;
              const expiresAt = connectedAt + timerMinutes * 60;
              timerActive = now < expiresAt;
            }

            return { online, blocked, upSpeed, downSpeed, timerActive };
          } catch (e) {
            console.error(`[metrics] Error fetching detail for ${host.mac}:`, e);
            return null;
          }
        })
      );

      const metrics: GuestMetrics = {
        totalGuests: 0,
        onlineGuests: 0,
        blockedGuests: 0,
        totalUpSpeed: 0,
        totalDownSpeed: 0,
        timerEnabled: config.guestTimerEnabled,
        timerMinutes: config.guestTimerMinutes,
        timerActiveCount: 0,
      };

      for (const r of results) {
        if (!r) continue;
        metrics.totalGuests++;
        if (r.online) metrics.onlineGuests++;
        if (r.blocked) metrics.blockedGuests++;
        metrics.totalUpSpeed += r.upSpeed;
        metrics.totalDownSpeed += r.downSpeed;
        if (r.timerActive) metrics.timerActiveCount++;
      }

      return c.json(metrics);
    } catch (error) {
      console.error("[metrics] Route error:", error instanceof Error ? error.message : String(error));
      return c.json({ error: "Failed to get guest metrics" }, 500);
    }
  });

  app.post("/:mac/timer", async (c) => {
    const mac = c.req.param("mac");
    try {
      const body = await c.req.json<{ minutes: number }>();
      if (!body.minutes || body.minutes < 1) {
        return c.json({ error: "minutes must be >= 1" }, 400);
      }
      perDeviceTimers.set(mac, body.minutes);
      return c.json({ success: true, mac, minutes: body.minutes });
    } catch (error) {
      console.error(`Failed to set timer for ${mac}:`, error);
      return c.json({ error: "Failed to set timer" }, 500);
    }
  });

  app.delete("/:mac/timer", (c) => {
    const mac = c.req.param("mac");
    perDeviceTimers.delete(mac);
    return c.json({ success: true, mac });
  });

  return app;
}
