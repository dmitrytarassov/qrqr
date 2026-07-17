import { canvasToBlob } from "../qr/render-canvas";

export function readClipboardText(): Promise<string> {
  return navigator.clipboard.readText();
}

export async function copyPngToClipboard(
  canvas: HTMLCanvasElement,
): Promise<boolean> {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": canvasToBlob(canvas) }),
    ]);
    return true;
  } catch {
    return false;
  }
}
