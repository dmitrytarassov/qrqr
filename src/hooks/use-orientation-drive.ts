import { useEffect, type RefObject } from "react";

// наклон телефона на ±15° от нейтрального хвата даёт максимум эффекта
const RANGE_DEG = 15;
// нейтральный хват никто не держит ровно — медленно подстраиваем базу,
// чтобы карточка реагировала на движение, а не на позу
const BASELINE_ALPHA = 0.02;

type OrientationEventCtor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<string>;
};

// источник «наведения» с акселерометра: тот же контракт, что у
// use-pointer-drive — смещение [-0.5, 0.5] по обеим осям
export function useOrientationDrive(
  areaRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onMove: (x: number, y: number) => void,
  onReset: () => void,
): void {
  useEffect(() => {
    if (!areaRef.current || !enabled) return;
    if (typeof DeviceOrientationEvent === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let baseBeta: number | null = null;
    let baseGamma: number | null = null;

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      baseBeta =
        baseBeta === null
          ? e.beta
          : baseBeta + (e.beta - baseBeta) * BASELINE_ALPHA;
      baseGamma =
        baseGamma === null
          ? e.gamma
          : baseGamma + (e.gamma - baseGamma) * BASELINE_ALPHA;
      onMove(
        (e.gamma - baseGamma) / (RANGE_DEG * 2),
        (e.beta - baseBeta) / (RANGE_DEG * 2),
      );
    };

    const attach = () =>
      window.addEventListener("deviceorientation", onOrientation);

    // iOS 13+ отдаёт сенсор только после requestPermission, и звать его
    // можно только из жеста пользователя — цепляемся к первому тапу
    const ctor = DeviceOrientationEvent as OrientationEventCtor;
    const askPermission = () => {
      ctor.requestPermission?.().then(
        (result) => {
          if (result === "granted") attach();
        },
        () => undefined,
      );
    };

    if (ctor.requestPermission) {
      window.addEventListener("pointerdown", askPermission, { once: true });
    } else {
      attach();
    }

    return () => {
      window.removeEventListener("pointerdown", askPermission);
      window.removeEventListener("deviceorientation", onOrientation);
      onReset();
    };
  }, [areaRef, enabled, onMove, onReset]);
}
