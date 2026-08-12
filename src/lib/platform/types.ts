export interface ShareInput {
  canvas: HTMLCanvasElement;
  text: string;
}

export interface PlatformAdapter {
  name: "telegram" | "web";
  share(input: ShareInput): Promise<void>;
  // есть только там, где платформа даёт нативный сканер (телега);
  // null — пользователь закрыл сканер, не отсканировав
  scanQr?(): Promise<string | null>;
}
