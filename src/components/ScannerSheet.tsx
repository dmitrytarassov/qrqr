import { useEffect, useRef, useState } from "react";

import { createQrScanner } from "../lib/scanner";

const SCAN_INTERVAL_MS = 250;

interface Props {
  open: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
}

export function ScannerSheet({ open, onClose, onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);

    let cancelled = false;
    let found = false;
    let stream: MediaStream | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;

    const start = async () => {
      const scanner = await createQrScanner();
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
      } catch {
        if (!cancelled) setError("камера недоступна — выбери фото с кодом");
        return;
      }
      const video = videoRef.current;
      if (cancelled || !video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      timer = setInterval(() => {
        void scanner.scanVideo(video).then((text) => {
          if (!text || cancelled || found) return;
          found = true;
          onResult(text);
        });
      }, SCAN_INTERVAL_MS);
    };
    void start();

    return () => {
      cancelled = true;
      clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [open, onResult]);

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    const scanner = await createQrScanner();
    const text = await scanner.scanImageFile(file).catch(() => null);
    if (text) onResult(text);
    else setError("на этой картинке qr-код не нашёлся");
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-bg"
      role="dialog"
      aria-modal
      aria-label="сканер qr-кода"
    >
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="text-[13px] text-muted">наведи камеру на qr-код</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-line px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:border-lime-edge hover:text-ink"
        >
          закрыть
        </button>
      </div>
      <div className="grid min-h-0 flex-1 place-items-center px-5 py-4">
        {error ? (
          <p className="max-w-60 text-center text-[13px] text-faint">{error}</p>
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className="aspect-square w-[min(85vw,420px,60dvh)] rounded-[18px] bg-black/20 object-cover"
          />
        )}
      </div>
      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            void pickFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-xl border border-line py-2.5 text-[13px] text-muted transition-colors hover:border-lime-edge hover:text-ink"
        >
          из фото
        </button>
      </div>
    </div>
  );
}
