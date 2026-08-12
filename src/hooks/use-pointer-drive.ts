import { useEffect, type RefObject } from "react";

// источник «наведения» с мыши: отдаёт смещение курсора от центра области
// в долях стороны, [-0.5, 0.5]. area статична — повёрнутый target не
// уезжает из-под курсора
export function usePointerDrive(
  areaRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onMove: (x: number, y: number) => void,
  onReset: () => void,
): void {
  useEffect(() => {
    const area = areaRef.current;
    if (!area || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const move = (e: PointerEvent) => {
      const rect = area.getBoundingClientRect();
      onMove(
        (e.clientX - rect.left) / rect.width - 0.5,
        (e.clientY - rect.top) / rect.height - 0.5,
      );
    };

    area.addEventListener("pointermove", move);
    area.addEventListener("pointerleave", onReset);
    return () => {
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", onReset);
      onReset();
    };
  }, [areaRef, enabled, onMove, onReset]);
}
