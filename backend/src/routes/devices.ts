import { Hono } from "hono";
import type { RouterClient } from "../router-client.js";
import type { ConfigManager } from "../config-manager.js";
import type { DeviceInfo } from "../types.js";

type Variables = {
  routerClient: RouterClient;
  configManager: ConfigManager;
};

export function createDevicesRouter(routerClient: RouterClient, configManager: ConfigManager) {
  const app = new Hono<{ Variables: Variables }>();

  app.use("*", async (c, next) => {
    c.set("routerClient", routerClient);
    c.set("configManager", configManager);
    await next();
  });

  // GET / - List all devices with details
  app.get("/", async (c) => {
    const client = c.get("routerClient");
    const config = configManager.getConfig();

    try {
      const hosts = await client.getDevices();
      console.log(`[devices] Got ${hosts.length} hosts from router`);
      hosts.forEach((h) => console.log(`  host: alias="${h.alias}" mac=${h.mac} ip=${h.ip} online=${h.online} second=${h.second}`));

      const devicesWithDetails = await Promise.all(
        hosts.map(async (host) => {
          try {
            const detail = await client.getDeviceDetail(host.mac);
            console.log(`[devices] Detail for ${host.mac}: alias="${detail.alias}" mac="${detail.mac}" ifname="${detail.ifname}" is_black=${detail.is_black} second=${detail.second}`);

            const deviceInfo: DeviceInfo = {
              alias: detail.alias ?? host.alias ?? "",
              hostname: detail.hostname ?? "",
              mac: detail.mac ?? host.mac ?? "",
              ip: detail.ip ?? host.ip ?? "",
              ifname: detail.ifname ?? "",
              guest: config.guestInterfaces.includes(detail.ifname ?? ""),
              blocked: detail.is_black ?? false,
              seconds: detail.second ?? host.second ?? 0,
              rssi: detail.rssi ?? 0,
              online: detail.online ?? host.online ?? false,
              up_speed: detail.up_speed ?? 0,
              down_speed: detail.down_speed ?? 0,
              txrate: detail.txrate ?? 0,
              rxrate: detail.rxrate ?? 0,
              is_5g: (detail.is_5g ?? 0) === 1,
              is_wifi: (detail.is_wifi ?? 0) === 1,
              support_11k: detail.support_11k ?? false,
              support_11v: detail.support_11v ?? false,
            };

            return deviceInfo;
          } catch (error) {
            console.error(`[devices] Failed to get detail for ${host.mac}:`, error);
            return {
              alias: host.alias ?? "",
              hostname: "",
              mac: host.mac ?? "",
              ip: host.ip ?? "",
              ifname: "",
              guest: false,
              blocked: false,
              seconds: host.second ?? 0,
              rssi: 0,
              online: host.online ?? false,
              up_speed: 0,
              down_speed: 0,
              txrate: 0,
              rxrate: 0,
              is_5g: false,
              is_wifi: false,
              support_11k: false,
              support_11v: false,
            } satisfies DeviceInfo;
          }
        })
      );

      console.log(`[devices] Returning ${devicesWithDetails.length} devices`);
      return c.json(devicesWithDetails);
    } catch (error) {
      console.error("Failed to get devices:", error);
      return c.json({ error: "Failed to get devices" }, 500);
    }
  });

  // POST /:mac/block - Block a device
  app.post("/:mac/block", async (c) => {
    const client = c.get("routerClient");
    const mac = c.req.param("mac");

    try {
      await client.blockDevice(mac);
      return c.json({ success: true });
    } catch (error) {
      console.error(`Failed to block device ${mac}:`, error);
      return c.json({ error: "Failed to block device" }, 500);
    }
  });

  // POST /:mac/unblock - Unblock a device
  app.post("/:mac/unblock", async (c) => {
    const client = c.get("routerClient");
    const mac = c.req.param("mac");

    try {
      await client.unblockDevice(mac);
      return c.json({ success: true });
    } catch (error) {
      console.error(`Failed to unblock device ${mac}:`, error);
      return c.json({ error: "Failed to unblock device" }, 500);
    }
  });

  return app;
}