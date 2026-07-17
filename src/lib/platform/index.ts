import { createTelegramAdapter, isTelegramMiniApp } from "./telegram";
import type { PlatformAdapter } from "./types";
import { createWebAdapter } from "./web";

export type { PlatformAdapter, ShareInput } from "./types";

let platform: Promise<PlatformAdapter> | undefined;

export function getPlatform(): Promise<PlatformAdapter> {
  platform ??= isTelegramMiniApp()
    ? createTelegramAdapter().catch(createWebAdapter)
    : Promise.resolve(createWebAdapter());
  return platform;
}
