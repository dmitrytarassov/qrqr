export const COLOR_PRESETS = [
  "#111110",
  "#2B2BFF",
  "#FF4D00",
  "#0F6E56",
  "#993556",
] as const;

export type ModuleShape = "square" | "rounded" | "dots";

export interface Settings {
  color: string;
  shape: ModuleShape;
  logo: string | null;
}

export const defaultSettings: Settings = {
  color: COLOR_PRESETS[0],
  shape: "square",
  logo: null,
};

export type SettingsAction =
  | { type: "color"; color: string }
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
