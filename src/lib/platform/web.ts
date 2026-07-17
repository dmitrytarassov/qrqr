import type { PlatformAdapter } from "./types";

import { canvasToBlob } from "../../qr/render-canvas";
import { downloadBlob } from "../download";

export function createWebAdapter(): PlatformAdapter {
  return {
    name: "web",
    async share({ canvas }) {
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], "qrqr.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError")
            return;
        }
      }
      downloadBlob(blob, "qrqr.png");
    },
  };
}
