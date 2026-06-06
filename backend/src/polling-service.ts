import type { RouterClient } from "./router-client.js";
import type { ConfigManager } from "./config-manager.js";

export class PollingService {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  start(routerClient: RouterClient, configManager: ConfigManager): void {
    if (this.intervalId !== null) {
      console.log("PollingService: Already running");
      return;
    }

    const poll = async () => {
      try {
        const config = configManager.getConfig();

        if (!config.autoBlockEnabled) {
          return;
        }

        const devices = await routerClient.getDevices();
        const onlineDevices = devices.filter((d) => d.online);

        for (const device of onlineDevices) {
          try {
            const detail = await routerClient.getDeviceDetail(device.mac);
            const isGuestInterface = config.guestInterfaces.includes(detail.ifname);
            const hasExceededTime = detail.second >= config.maxMinutes * 60;
            const isNotBlocked = !detail.is_black;

            if (isGuestInterface && hasExceededTime && isNotBlocked) {
              console.log(
                `PollingService: Auto-blocking guest device ${detail.alias} (${detail.mac}) - ` +
                  `interface=${detail.ifname}, online=${detail.second}s, limit=${config.maxMinutes * 60}s`
              );
              await routerClient.blockDevice(detail.mac);
            }
          } catch (error) {
            console.error(`PollingService: Error processing device ${device.mac}:`, error);
          }
        }
      } catch (error) {
        console.error("PollingService: Polling error:", error);
      }
    };

    // Run immediately, then schedule
    poll();
    this.intervalId = setInterval(poll, configManager.getConfig().pollIntervalSeconds * 1000);
    console.log(
      `PollingService: Started with interval=${configManager.getConfig().pollIntervalSeconds}s`
    );
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("PollingService: Stopped");
    }
  }

  restart(routerClient: RouterClient, configManager: ConfigManager): void {
    this.stop();
    this.start(routerClient, configManager);
  }
}