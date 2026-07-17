type CanvasSource = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;

interface BarcodeDetectorResult {
  rawValue: string;
}

interface BarcodeDetectorLike {
  detect(source: CanvasSource): Promise<BarcodeDetectorResult[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: string[] }): BarcodeDetectorLike;
      getSupportedFormats?: () => Promise<string[]>;
    };
  }
}

// jsQR дорогой на больших кадрах — ужимаем длинную сторону
const MAX_SIDE = 800;

type Decode = (canvas: HTMLCanvasElement) => Promise<string | null>;

async function createDecode(): Promise<Decode> {
  const Detector = window.BarcodeDetector;
  if (Detector) {
    try {
      const formats = (await Detector.getSupportedFormats?.()) ?? [];
      if (formats.includes("qr_code")) {
        const detector = new Detector({ formats: ["qr_code"] });
        return async (canvas) => {
          const codes = await detector.detect(canvas);
          return codes[0]?.rawValue ?? null;
        };
      }
    } catch {
      // нативный детектор не завёлся — падаем на jsQR
    }
  }
  const { default: jsQR } = await import("jsqr");
  return (canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return Promise.resolve(null);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return Promise.resolve(
      jsQR(data.data, canvas.width, canvas.height)?.data ?? null,
    );
  };
}

export interface QrScanner {
  scanVideo(video: HTMLVideoElement): Promise<string | null>;
  scanImageFile(file: File): Promise<string | null>;
}

export async function createQrScanner(): Promise<QrScanner> {
  const decode = await createDecode();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const grab = (source: CanvasSource, width: number, height: number) => {
    if (!ctx) return false;
    const ratio = Math.min(1, MAX_SIDE / Math.max(width, height));
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return true;
  };

  return {
    scanVideo(video) {
      if (
        !video.videoWidth ||
        !grab(video, video.videoWidth, video.videoHeight)
      )
        return Promise.resolve(null);
      return decode(canvas);
    },
    async scanImageFile(file) {
      const url = URL.createObjectURL(file);
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error("не удалось прочитать картинку"));
          el.src = url;
        });
        if (!grab(img, img.naturalWidth, img.naturalHeight)) return null;
        return await decode(canvas);
      } finally {
        URL.revokeObjectURL(url);
      }
    },
  };
}
