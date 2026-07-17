import { useEffect, type RefObject } from "react";

import { tiltTransform } from "../lib/tilt";

// слежение и трансформ разнесены по разным элементам: area статична,
// иначе повёрнутая карточка уезжает из-под курсора и tilt дёргается
export function useTilt(
  areaRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    const area = areaRef.current;
    const target = targetRef.current;
    if (!area || !target || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const move = (e: PointerEvent) => {
      const rect = area.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      target.style.transition = "";
      target.style.transform = tiltTransform(x, y);
    };
    const leave = () => {
      target.style.transition = "transform 0.3s ease";
      target.style.transform = "";
    };

    area.addEventListener("pointermove", move);
    area.addEventListener("pointerleave", leave);
    return () => {
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
      leave();
    };
  }, [areaRef, targetRef, enabled]);
}
