import { Hono } from "hono";
import { cors } from "hono/cors";
import { RouterClient } from "./router-client.js";
import { ConfigManager } from "./config-manager.js";
import { PollingService } from "./polling-service.js";
import { createDevicesRouter } from "./routes/devices.js";
import { createConfigRouter } from "./routes/config.js";

const app = new Hono();

// Initialize services
const configManager = new ConfigManager();
const config = configManager.getConfig();

const username = config.routerUsername || "useradmin";
const password = config.routerPassword || "Cliente@168842";

if (!config.routerUsername || !config.routerPassword) {
  console.warn("⚠️  Credenciales no configuradas en config.json, usando defaults.");
  console.warn("   Para mayor seguridad: cp config.example.json config.json y editalo.");
}

const routerClient = new RouterClient(username, password);
const pollingService = new PollingService();

// CORS middleware for local dev
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

// Mount routes
app.route("/api/devices", createDevicesRouter(routerClient, configManager));
app.route("/api/config", createConfigRouter(routerClient, configManager, pollingService));

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Start polling service
pollingService.start(routerClient, configManager);

// Start server
const port = 3000;
console.log(`Router Guest Manager backend starting on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
};