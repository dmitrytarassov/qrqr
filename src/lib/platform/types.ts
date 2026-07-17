export interface ShareInput {
  canvas: HTMLCanvasElement;
  text: string;
}

export interface PlatformAdapter {
  name: "telegram" | "web";
  share(input: ShareInput): Promise<void>;
}
