export const TILT_MAX_DEG = 2.5;

const clamp = (v: number) => Math.max(-0.5, Math.min(0.5, v));

// x, y — смещение от центра в долях стороны, [-0.5, 0.5]
export function tiltTransform(
  x: number,
  y: number,
  maxDeg: number = TILT_MAX_DEG,
): string {
  const rotateX = (-clamp(y) * maxDeg * 2).toFixed(2);
  const rotateY = (clamp(x) * maxDeg * 2).toFixed(2);
  return `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}
