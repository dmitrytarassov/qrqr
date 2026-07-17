import { downloadBlob } from "./download";

import { canvasToBlob } from "../qr/render-canvas";

export async function shareQr(canvas: HTMLCanvasElement): Promise<void> {
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], "qrqr.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }
  downloadBlob(blob, "qrqr.png");
}
