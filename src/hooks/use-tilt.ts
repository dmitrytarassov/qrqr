import { useEffect, type RefObject } from "react";

const MAX_DEG = 2.5;

export function useTilt(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const move = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transition = "";
      el.style.transform = `perspective(900px) rotateX(${(-py * MAX_DEG * 2).toFixed(2)}deg) rotateY(${(px * MAX_DEG * 2).toFixed(2)}deg)`;
    };
    const leave = () => {
      el.style.transition = "transform 0.3s ease";
      el.style.transform = "";
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      leave();
    };
  }, [ref, enabled]);
}
