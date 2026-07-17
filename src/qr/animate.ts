import type { Matrix } from "./matrix";
import { drawQr, type QrStyle } from "./render-canvas";

const MODULE_MS = 100;
const SPREAD_MS = 80;

const ease = (t: number) => 1 - (1 - t) ** 3;

// детерминированный «случайный» разброс задержек по модулям
const delayAt = (row: number, col: number) =>
  (((row * 31 + col * 17) % 13) / 12) * SPREAD_MS;

export function animateQr(
  canvas: HTMLCanvasElement,
  prev: Matrix | null,
  next: Matrix,
  style: QrStyle,
  size: number,
  onDone: () => void,
): () => void {
  const count = next.length;
  const from = prev && prev.length === count ? prev : null;
  const union: Matrix = next.map((row, r) =>
    row.map((dark, c) => dark || (from?.[r][c] ?? false)),
  );

  let raf = 0;
  const start = performance.now();

  const frame = (now: number) => {
    const t = now - start;
    if (t >= SPREAD_MS + MODULE_MS) {
      drawQr(canvas, next, style, size);
      onDone();
      return;
    }
    drawQr(canvas, union, style, size, (row, col) => {
      const was = from?.[row][col] ?? false;
      const is = next[row][col];
      if (was === is) return 1;
      const progress = Math.min(
        1,
        Math.max(0, (t - delayAt(row, col)) / MODULE_MS),
      );
      return is ? ease(progress) : 1 - ease(progress);
    });
    raf = requestAnimationFrame(frame);
  };

  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
