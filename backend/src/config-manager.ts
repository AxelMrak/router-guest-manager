import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { AppConfig } from "./types.js";
import { DEFAULT_CONFIG } from "./types.js";

export class ConfigManager {
  private config: AppConfig;
  private readonly configPath: string;

  constructor() {
    this.configPath = resolve(__dirname, "../../config.json");
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    try {
      if (existsSync(this.configPath)) {
        const fileContent = readFileSync(this.configPath, "utf-8");
        const loaded = JSON.parse(fileContent) as Partial<AppConfig>;
        return { ...DEFAULT_CONFIG, ...loaded };
      }
    } catch (error) {
      console.error("Failed to load config, using defaults:", error);
    }
    return { ...DEFAULT_CONFIG };
  }

  private saveConfig(): void {
    try {
      const dirPath = resolve(this.configPath, "..");
      if (!existsSync(dirPath)) {
        // Config file directory doesn't exist, config.json is at root
      }
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save config:", error);
      throw error;
    }
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  updateConfig(partial: Partial<AppConfig>): AppConfig {
    this.config = { ...this.config, ...partial };
    this.saveConfig();
    return { ...this.config };
  }
}