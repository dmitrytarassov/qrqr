import type { PlatformAdapter } from "./types";

interface TelegramWebApp {
  platform: string;
  ready(): void;
  expand(): void;
  isVersionAtLeast(version: string): boolean;
  openTelegramLink(url: string): void;
  showScanQrPopup(
    params: { text?: string },
    callback?: (text: string) => boolean,
  ): void;
  closeScanQrPopup(): void;
  onEvent(event: "scanQrPopupClosed", handler: () => void): void;
  offEvent(event: "scanQrPopupClosed", handler: () => void): void;
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

  // сканер появился в bot api 6.4; на desktop/web-клиентах телеги его нет,
  // там метод объявлен, но молча не работает — гейтим и по платформе тоже
  const canScanQr =
    webApp.isVersionAtLeast("6.4") &&
    (webApp.platform === "ios" || webApp.platform === "android");

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
    ...(canScanQr && {
      scanQr() {
        // нативный сканер телеги: камера самого приложения,
        // webview-промпта с запросом доступа нет
        return new Promise<string | null>((resolve) => {
          const done = (text: string | null) => {
            webApp.offEvent("scanQrPopupClosed", onClosed);
            resolve(text);
          };
          const onClosed = () => done(null);
          webApp.onEvent("scanQrPopupClosed", onClosed);
          webApp.showScanQrPopup({}, (text) => {
            done(text);
            return true; // закрыть попап после первого кода
          });
        });
      },
    }),
  };
}
