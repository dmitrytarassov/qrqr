export interface ColorPreset {
  id: string;
  from: string;
  to: string;
}

// оба конца каждой пары тёмные: градиент градиентом, а сканируемость
// на белой карточке важнее
export const COLOR_PRESETS: ColorPreset[] = [
  { id: "ink", from: "#111110", to: "#454540" },
  { id: "indigo", from: "#2B2BFF", to: "#8A1FD6" },
  { id: "fire", from: "#FF4D00", to: "#D6006E" },
  { id: "sea", from: "#0F6E56", to: "#123F8C" },
  { id: "berry", from: "#993556", to: "#4F2D91" },
];

export type ModuleShape = "square" | "rounded" | "dots";

export interface Settings {
  color: ColorPreset;
  shape: ModuleShape;
  logo: string | null;
}

export const defaultSettings: Settings = {
  color: COLOR_PRESETS[0],
  shape: "square",
  logo: null,
};

export type SettingsAction =
  | { type: "color"; color: ColorPreset }
  | { type: "shape"; shape: ModuleShape }
  | { type: "logo"; logo: string | null };

export function settingsReducer(
  settings: Settings,
  action: SettingsAction,
): Settings {
  switch (action.type) {
    case "color":
      return { ...settings, color: action.color };
    case "shape":
      return { ...settings, shape: action.shape };
    case "logo":
      return { ...settings, logo: action.logo };
  }
}
