import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type RefObject,
} from "react";

import { useMediaQuery } from "../hooks/use-media-query";
import { useOrientationDrive } from "../hooks/use-orientation-drive";
import { usePointerDrive } from "../hooks/use-pointer-drive";
import { loadImage } from "../lib/image";
import { gradientPosition, tiltTransform } from "../lib/tilt";
import { animateQr } from "../qr/animate";
import type { Matrix } from "../qr/matrix";
import { drawQr, drawQrMask, type QrStyle } from "../qr/render-canvas";
import type { Settings } from "../state/settings";

export const QR_CANVAS_SIZE = 1080;

interface Props {
  matrix: Matrix;
  isPlaceholder: boolean;
  settings: Settings;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onOpenSettings: () => void;
  onLogoFile: (file: File) => void;
}

export function QrCard({
  matrix,
  isPlaceholder,
  settings,
  canvasRef,
  onOpenSettings,
  onLogoFile,
}: Props) {
  const [imgSrc, setImgSrc] = useState("");
  const [maskSrc, setMaskSrc] = useState("");
  const [settled, setSettled] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const prevMatrix = useRef<Matrix | null>(null);
  const maskCanvas = useRef<HTMLCanvasElement | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");

  // один вход для обоих источников (мышь / акселерометр):
  // наклон карточки и позиция градиента едут от одних и тех же (x, y)
  const drive = useCallback((x: number, y: number) => {
    const tiltEl = tiltRef.current;
    if (tiltEl) {
      tiltEl.style.transition = "";
      tiltEl.style.transform = tiltTransform(x, y);
    }
    const gradientEl = gradientRef.current;
    if (gradientEl) {
      gradientEl.style.transition = "";
      gradientEl.style.backgroundPosition = gradientPosition(x, y);
    }
  }, []);
  const resetDrive = useCallback(() => {
    const tiltEl = tiltRef.current;
    if (tiltEl) {
      tiltEl.style.transition = "transform 0.3s ease";
      tiltEl.style.transform = "";
    }
    const gradientEl = gradientRef.current;
    if (gradientEl) {
      gradientEl.style.transition = "background-position 0.3s ease";
      gradientEl.style.backgroundPosition = "50% 50%";
    }
  }, []);

  usePointerDrive(areaRef, hoverCapable, drive, resetDrive);
  useOrientationDrive(areaRef, !hoverCapable, drive, resetDrive);

  useEffect(() => {
    if (!settings.logo) {
      setLogoImg(null);
      return;
    }
    let stale = false;
    loadImage(settings.logo).then(
      (img) => {
        if (!stale) setLogoImg(img);
      },
      () => undefined,
    );
    return () => {
      stale = true;
    };
  }, [settings.logo]);

  const style = useMemo<QrStyle>(
    () => ({
      color: settings.color,
      shape: settings.shape,
      logo: isPlaceholder ? null : logoImg,
    }),
    [isPlaceholder, settings.color, settings.shape, logoImg],
  );

  // основной рендер: stagger-переход к новой матрице, затем синк в <img> и маску
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const finish = () => {
      setImgSrc(canvas.toDataURL("image/png"));
      maskCanvas.current ??= document.createElement("canvas");
      drawQrMask(
        maskCanvas.current,
        matrix,
        style.shape,
        QR_CANVAS_SIZE,
        Boolean(style.logo),
      );
      setMaskSrc(maskCanvas.current.toDataURL("image/png"));
      setSettled(true);
    };

    const sameMatrix = prevMatrix.current === matrix;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let cancel: (() => void) | undefined;

    if (sameMatrix || reducedMotion) {
      drawQr(canvas, matrix, style, QR_CANVAS_SIZE);
      finish();
    } else {
      setSettled(false);
      cancel = animateQr(
        canvas,
        prevMatrix.current,
        matrix,
        style,
        QR_CANVAS_SIZE,
        finish,
      );
    }
    prevMatrix.current = matrix;
    return cancel;
  }, [matrix, style, canvasRef]);

  const dragOver = (e: DragEvent) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    setDragging(true);
  };
  const drop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) onLogoFile(file);
  };

  const overlayVisible = settled && !isPlaceholder;

  return (
    <div
      ref={areaRef}
      role="button"
      tabIndex={0}
      aria-label="настройки кода"
      onClick={onOpenSettings}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenSettings();
        }
      }}
      onDragOver={dragOver}
      onDragLeave={() => setDragging(false)}
      onDrop={drop}
      className="aspect-square w-[min(100cqmin,340px)] cursor-pointer md:w-[380px]"
    >
      <div
        ref={tiltRef}
        className={`relative h-full w-full rounded-[18px] bg-white p-4 shadow-[0_2px_16px_rgba(17,17,16,0.06)] ${
          dragging
            ? "outline-solid outline-2 outline-offset-4 outline-lime"
            : ""
        }`}
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className={`h-full w-full transition-opacity duration-300 ${isPlaceholder ? "opacity-35" : "opacity-100"}`}
        />
        {imgSrc && !isPlaceholder && (
          <img
            src={imgSrc}
            alt="QR-код"
            className={`absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] transition-opacity duration-200 ${settled ? "opacity-100" : "opacity-0"}`}
          />
        )}
        {maskSrc && (
          // «плавающий» градиент: CSS-фон больше карточки, маска — модули кода;
          // pointer-events нет, long-press проходит к <img> ниже
          <div
            ref={gradientRef}
            aria-hidden
            className={`pointer-events-none absolute inset-4 bg-center bg-[length:250%_250%] transition-opacity duration-200 ${overlayVisible ? "opacity-100" : "opacity-0"}`}
            style={{
              backgroundImage: `linear-gradient(135deg, ${settings.color.from}, ${settings.color.to})`,
              maskImage: `url(${maskSrc})`,
              WebkitMaskImage: `url(${maskSrc})`,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
            }}
          />
        )}
      </div>
    </div>
  );
}
