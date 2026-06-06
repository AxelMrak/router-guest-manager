import { Hono } from "hono";
import type { ConfigManager } from "../config-manager.js";
import type { PollingService } from "../polling-service.js";
import type { RouterClient } from "../router-client.js";
import type { AppConfig } from "../types.js";

type Variables = {
  configManager: ConfigManager;
  pollingService: PollingService;
  routerClient: RouterClient;
};

export function createConfigRouter(
  routerClient: RouterClient,
  configManager: ConfigManager,
  pollingService: PollingService
) {
  const app = new Hono<{ Variables: Variables }>();

  app.use("*", async (c, next) => {
    c.set("routerClient", routerClient);
    c.set("configManager", configManager);
    c.set("pollingService", pollingService);
    await next();
  });

  app.get("/", (c) => {
    const manager = c.get("configManager");
    const { routerUsername, routerPassword, ...safeConfig } = manager.getConfig();
    return c.json(safeConfig);
  });

  // PUT / - Update config
  app.put("/", async (c) => {
    const manager = c.get("configManager");
    const polling = c.get("pollingService");
    const client = c.get("routerClient");

    try {
      const body = await c.req.json<Partial<AppConfig>>();
      delete body.routerUsername;
      delete body.routerPassword;

      // Validate
      if (body.guestInterfaces && !Array.isArray(body.guestInterfaces)) {
        return c.json({ error: "guestInterfaces must be an array" }, 400);
      }
      if (body.guestInterfaces && body.guestInterfaces.some((i) => typeof i !== "string")) {
        return c.json({ error: "guestInterfaces must be an array of strings" }, 400);
      }
      if (body.maxMinutes !== undefined && (typeof body.maxMinutes !== "number" || body.maxMinutes < 1)) {
        return c.json({ error: "maxMinutes must be a positive number" }, 400);
      }
      if (body.autoBlockEnabled !== undefined && typeof body.autoBlockEnabled !== "boolean") {
        return c.json({ error: "autoBlockEnabled must be a boolean" }, 400);
      }
      if (
        body.pollIntervalSeconds !== undefined &&
        (typeof body.pollIntervalSeconds !== "number" || body.pollIntervalSeconds < 5)
      ) {
        return c.json({ error: "pollIntervalSeconds must be a number >= 5" }, 400);
      }

      const currentConfig = manager.getConfig();
      const updatedConfig = manager.updateConfig(body);

      // Restart polling if interval changed
      if (body.pollIntervalSeconds !== undefined && body.pollIntervalSeconds !== currentConfig.pollIntervalSeconds) {
        console.log(`Config: pollIntervalSeconds changed from ${currentConfig.pollIntervalSeconds} to ${body.pollIntervalSeconds}, restarting polling`);
        polling.restart(client, manager);
      }

      return c.json(updatedConfig);
    } catch (error) {
      console.error("Failed to update config:", error);
      return c.json({ error: "Failed to update config" }, 500);
    }
  });

  return app;
}