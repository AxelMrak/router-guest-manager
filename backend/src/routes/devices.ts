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
      const onlineHosts = hosts.filter((h) => h.online);

      const devicesWithDetails = await Promise.all(
        onlineHosts.map(async (host) => {
          try {
            const detail = await client.getDeviceDetail(host.mac);
            const isGuest = config.guestInterfaces.includes(detail.ifname);

            const deviceInfo: DeviceInfo = {
              alias: detail.alias,
              hostname: detail.hostname,
              mac: detail.mac,
              ip: detail.ip,
              ifname: detail.ifname,
              guest: isGuest,
              blocked: detail.is_black,
              seconds: detail.second,
              rssi: detail.rssi,
              online: detail.online,
            };

            return deviceInfo;
          } catch (error) {
            console.error(`Failed to get detail for ${host.mac}:`, error);
            // Return basic info from host list
            return {
              alias: host.alias,
              hostname: "",
              mac: host.mac,
              ip: host.ip,
              ifname: "",
              guest: false,
              blocked: false,
              seconds: host.second,
              rssi: 0,
              online: host.online,
            } satisfies DeviceInfo;
          }
        })
      );

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