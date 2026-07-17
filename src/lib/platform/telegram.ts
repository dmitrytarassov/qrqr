import type { PlatformAdapter } from "./types";

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  openTelegramLink(url: string): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
    TelegramWebviewProxy?: unknown;
  }
}

const TELEGRAM_SDK = "https://telegram.org/js/telegram-web-app.js";

// телега открывает mini app с tgWebApp*-параметрами в хэше; свой SDK мы грузим лениво,
// поэтому определяем окружение по этим следам, а не по window.Telegram
export function isTelegramMiniApp(): boolean {
  if (window.Telegram?.WebApp) return true;
  if (window.TelegramWebviewProxy !== undefined) return true;
  const hash = window.location.hash;
  if (hash.includes("tgWebAppPlatform") || hash.includes("tgWebAppData"))
    return true;
  try {
    return sessionStorage.getItem("__telegram__initParams") !== null;
  } catch {
    return false;
  }
}

async function loadSdk(): Promise<TelegramWebApp | null> {
  if (window.Telegram?.WebApp) return window.Telegram.WebApp;
  await new Promise<void>((resolve) => {
    const script = document.createElement("script");
    script.src = TELEGRAM_SDK;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.append(script);
  });
  return window.Telegram?.WebApp ?? null;
}

export async function createTelegramAdapter(): Promise<PlatformAdapter> {
  const webApp = await loadSdk();
  if (!webApp) throw new Error("telegram sdk не загрузился");
  webApp.ready();
  webApp.expand();

  return {
    name: "telegram",
    share({ text }) {
      // из mini app нельзя пошерить сгенерированный PNG без бэкенда
      // (нужен bot api: savePreparedInlineMessage + shareMessage),
      // поэтому шерим сам текст/ссылку нативным диалогом телеги
      const url = `https://t.me/share/url?url=${encodeURIComponent(text)}`;
      webApp.openTelegramLink(url);
      return Promise.resolve();
    },
  };
}
