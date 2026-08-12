import type { Matrix } from "./matrix";

import type { ColorPreset, ModuleShape } from "../state/settings";

export interface QrStyle {
  color: ColorPreset;
  shape: ModuleShape;
  logo: HTMLImageElement | null;
}

export type ScaleAt = (row: number, col: number) => number;

export const QUIET_ZONE = 2;
export const LOGO_BOX = 0.24;
export const LOGO_SIZE = 0.18;
export const LOGO_BOX_RADIUS = 0.25;

// радиусы скругления как доля стороны фигуры
export const FINDER_RADIUS: Record<ModuleShape, number> = {
  square: 0,
  rounded: 0.3,
  dots: 0.5,
};
export const MODULE_RADIUS: Record<ModuleShape, number> = {
  square: 0,
  rounded: 0.32,
  dots: 0.5,
};
export const DOT_SCALE = 0.86;

export function isFinder(row: number, col: number, count: number): boolean {
  return (
    (row < 7 && col < 7) ||
    (row < 7 && col >= count - 7) ||
    (row >= count - 7 && col < 7)
  );
}

function paintCode(
  ctx: CanvasRenderingContext2D,
  matrix: Matrix,
  shape: ModuleShape,
  size: number,
  scaleAt?: ScaleAt,
): void {
  const count = matrix.length;
  const module = size / (count + QUIET_ZONE * 2);
  const offset = QUIET_ZONE * module;

  for (const [row, col] of [
    [0, 0],
    [0, count - 7],
    [count - 7, 0],
  ]) {
    drawFinder(
      ctx,
      offset + col * module,
      offset + row * module,
      module,
      shape,
    );
  }

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!matrix[row][col] || isFinder(row, col, count)) continue;
      const scale = scaleAt ? scaleAt(row, col) : 1;
      if (scale <= 0.01) continue;
      drawModule(
        ctx,
        offset + col * module,
        offset + row * module,
        module,
        shape,
        scale,
      );
    }
  }
}

export function drawQr(
  canvas: HTMLCanvasElement,
  matrix: Matrix,
  style: QrStyle,
  size: number,
  scaleAt?: ScaleAt,
): void {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);

  // один диагональный градиент на весь код: модули берут свой локальный цвет
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, style.color.from);
  gradient.addColorStop(1, style.color.to);
  ctx.fillStyle = gradient;
  paintCode(ctx, matrix, style.shape, size, scaleAt);

  if (style.logo) drawLogo(ctx, style.logo, size);
}

// альфа-маска модулей на прозрачном фоне — для CSS-градиента поверх кода;
// зона логотипа выбивается, чтобы градиент не лёг на белую подложку
export function drawQrMask(
  canvas: HTMLCanvasElement,
  matrix: Matrix,
  shape: ModuleShape,
  size: number,
  hasLogo: boolean,
): void {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#000000";
  paintCode(ctx, matrix, shape, size);

  if (hasLogo) {
    const box = size * LOGO_BOX;
    const boxOffset = (size - box) / 2;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.roundRect(boxOffset, boxOffset, box, box, box * LOGO_BOX_RADIUS);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }
}

function drawFinder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  module: number,
  shape: ModuleShape,
): void {
  const radius = FINDER_RADIUS[shape];
  ctx.beginPath();
  ctx.roundRect(x, y, 7 * module, 7 * module, 7 * module * radius);
  ctx.roundRect(
    x + module,
    y + module,
    5 * module,
    5 * module,
    5 * module * radius,
  );
  ctx.fill("evenodd");
  ctx.beginPath();
  ctx.roundRect(
    x + 2 * module,
    y + 2 * module,
    3 * module,
    3 * module,
    3 * module * radius,
  );
  ctx.fill();
}

function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  module: number,
  shape: ModuleShape,
  scale: number,
): void {
  if (shape === "dots") {
    ctx.beginPath();
    ctx.arc(
      x + module / 2,
      y + module / 2,
      (module / 2) * DOT_SCALE * scale,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    return;
  }
  // квадраты рисуем с напуском, чтобы между соседями не было волосяных щелей
  const bleed = shape === "square" ? 0.35 : 0;
  const side = module * scale + bleed;
  const pad = (module - side) / 2;
  ctx.beginPath();
  ctx.roundRect(x + pad, y + pad, side, side, side * MODULE_RADIUS[shape]);
  ctx.fill();
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  size: number,
): void {
  const box = size * LOGO_BOX;
  const boxOffset = (size - box) / 2;
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(boxOffset, boxOffset, box, box, box * LOGO_BOX_RADIUS);
  ctx.fill();

  const max = size * LOGO_SIZE;
  const ratio = Math.min(max / logo.naturalWidth, max / logo.naturalHeight);
  const width = logo.naturalWidth * ratio;
  const height = logo.naturalHeight * ratio;
  ctx.drawImage(logo, (size - width) / 2, (size - height) / 2, width, height);
  ctx.restore();
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("canvas.toBlob вернул null")),
      "image/png",
    );
  });
}
