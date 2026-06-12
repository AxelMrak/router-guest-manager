import type { RouterClient } from "./router-client.js";
import type { ConfigManager } from "./config-manager.js";

const GUEST_INTERFACES = ["ra2", "rax2"];

export class PollingService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private guestTimerId: ReturnType<typeof setInterval> | null = null;

  start(routerClient: RouterClient, configManager: ConfigManager): void {
    this.startAutoBlock(routerClient, configManager);
    this.startGuestTimer(routerClient, configManager);
  }

  private startAutoBlock(routerClient: RouterClient, configManager: ConfigManager): void {
    if (this.intervalId !== null) {
      console.log("PollingService: Auto-block already running");
      return;
    }

    const poll = async () => {
      try {
        const config = configManager.getConfig();
        if (!config.autoBlockEnabled) return;

        const devices = await routerClient.getDevices();
        const onlineDevices = devices.filter((d) => d.online);

        for (const device of onlineDevices) {
          try {
            const detail = await routerClient.getDeviceDetail(device.mac);
            const isGuest = GUEST_INTERFACES.includes(detail.ifname);
            const exceeded = detail.second >= config.maxMinutes * 60;
            const notBlocked = !detail.is_black;

            if (isGuest && exceeded && notBlocked) {
              console.log(
                `PollingService: Auto-blocking guest ${detail.alias} (${detail.mac}) - ` +
                  `${detail.second}s online, limit=${config.maxMinutes * 60}s`
              );
              await routerClient.blockDevice(detail.mac);
            }
          } catch (error) {
            console.error(`PollingService: Error processing ${device.mac}:`, error);
          }
        }
      } catch (error) {
        console.error("PollingService: Auto-block error:", error);
      }
    };

    poll();
    this.intervalId = setInterval(poll, configManager.getConfig().pollIntervalSeconds * 1000);
    console.log(`PollingService: Auto-block started (${configManager.getConfig().pollIntervalSeconds}s)`);
  }

  private startGuestTimer(routerClient: RouterClient, configManager: ConfigManager): void {
    if (this.guestTimerId !== null) {
      console.log("PollingService: Guest timer already running");
      return;
    }

    const check = async () => {
      try {
        const config = configManager.getConfig();
        if (!config.guestTimerEnabled) return;

        const devices = await routerClient.getDevices();
        const onlineDevices = devices.filter((d) => d.online);
        const now = Math.floor(Date.now() / 1000);

        for (const device of onlineDevices) {
          try {
            const detail = await routerClient.getDeviceDetail(device.mac);
            if (!GUEST_INTERFACES.includes(detail.ifname)) continue;
            if (detail.is_black) continue;

            const seconds = detail.second || device.second || 0;
            const connectedAt = now - seconds;
            const expiresAt = connectedAt + config.guestTimerMinutes * 60;

            if (now >= expiresAt) {
              console.log(
                `PollingService: Guest timer blocking ${detail.alias} (${detail.mac}) - ` +
                  `${seconds}s connected, timer=${config.guestTimerMinutes}min`
              );
              await routerClient.blockDevice(detail.mac);
            }
          } catch (error) {
            console.error(`PollingService: Guest timer error for ${device.mac}:`, error);
          }
        }
      } catch (error) {
        console.error("PollingService: Guest timer error:", error);
      }
    };

    check();
    this.guestTimerId = setInterval(check, 30000);
    console.log("PollingService: Guest timer started (30s)");
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.guestTimerId !== null) {
      clearInterval(this.guestTimerId);
      this.guestTimerId = null;
    }
    console.log("PollingService: Stopped");
  }

  restart(routerClient: RouterClient, configManager: ConfigManager): void {
    this.stop();
    this.start(routerClient, configManager);
  }
}