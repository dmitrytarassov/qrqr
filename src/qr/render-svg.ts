import type { Matrix } from "./matrix";
import {
  DOT_SCALE,
  FINDER_RADIUS,
  isFinder,
  LOGO_BOX,
  LOGO_BOX_RADIUS,
  LOGO_SIZE,
  MODULE_RADIUS,
  QUIET_ZONE,
} from "./render-canvas";

import type { ModuleShape } from "../state/settings";

export interface SvgStyle {
  color: string;
  shape: ModuleShape;
  logo: string | null;
}

const f = (n: number) => String(Math.round(n * 1000) / 1000);

function roundRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string {
  if (r <= 0) return `M${f(x)},${f(y)}h${f(w)}v${f(h)}h${f(-w)}z`;
  r = Math.min(r, w / 2, h / 2);
  const arc = (dx: number, dy: number) =>
    `a${f(r)},${f(r)} 0 0 1 ${f(dx)},${f(dy)}`;
  return (
    `M${f(x + r)},${f(y)}h${f(w - 2 * r)}${arc(r, r)}v${f(h - 2 * r)}${arc(-r, r)}` +
    `h${f(-(w - 2 * r))}${arc(-r, -r)}v${f(-(h - 2 * r))}${arc(r, -r)}z`
  );
}

export function renderSvg(matrix: Matrix, style: SvgStyle): string {
  const count = matrix.length;
  const total = count + QUIET_ZONE * 2;
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}">`,
    `<rect width="${total}" height="${total}" fill="#FFFFFF"/>`,
  ];

  const finderRadius = FINDER_RADIUS[style.shape];
  for (const [row, col] of [
    [0, 0],
    [0, count - 7],
    [count - 7, 0],
  ]) {
    const x = QUIET_ZONE + col;
    const y = QUIET_ZONE + row;
    parts.push(
      `<path fill="${style.color}" fill-rule="evenodd" d="${
        roundRectPath(x, y, 7, 7, 7 * finderRadius) +
        roundRectPath(x + 1, y + 1, 5, 5, 5 * finderRadius)
      }"/>`,
      `<path fill="${style.color}" d="${roundRectPath(x + 2, y + 2, 3, 3, 3 * finderRadius)}"/>`,
    );
  }

  const cells: string[] = [];
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!matrix[row][col] || isFinder(row, col, count)) continue;
      const x = QUIET_ZONE + col;
      const y = QUIET_ZONE + row;
      if (style.shape === "dots") {
        cells.push(
          `<circle cx="${f(x + 0.5)}" cy="${f(y + 0.5)}" r="${f(DOT_SCALE / 2)}"/>`,
        );
      } else if (style.shape === "rounded") {
        cells.push(
          `<rect x="${x}" y="${y}" width="1" height="1" rx="${MODULE_RADIUS.rounded}"/>`,
        );
      } else {
        cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
      }
    }
  }
  const crisp = style.shape === "square" ? ' shape-rendering="crispEdges"' : "";
  parts.push(`<g fill="${style.color}"${crisp}>${cells.join("")}</g>`);

  if (style.logo) {
    const box = total * LOGO_BOX;
    const boxOffset = (total - box) / 2;
    const logoSize = total * LOGO_SIZE;
    const logoOffset = (total - logoSize) / 2;
    parts.push(
      `<rect x="${f(boxOffset)}" y="${f(boxOffset)}" width="${f(box)}" height="${f(box)}" rx="${f(box * LOGO_BOX_RADIUS)}" fill="#FFFFFF"/>`,
      `<image href="${style.logo}" x="${f(logoOffset)}" y="${f(logoOffset)}" width="${f(logoSize)}" height="${f(logoSize)}" preserveAspectRatio="xMidYMid meet"/>`,
    );
  }

  parts.push("</svg>");
  return parts.join("");
}
