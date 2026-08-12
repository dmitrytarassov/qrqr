import { COLOR_PRESETS, type ColorPreset } from "../../state/settings";

interface Props {
  value: ColorPreset;
  onChange: (color: ColorPreset) => void;
}

export function ColorPresets({ value, onChange }: Props) {
  return (
    <div className="flex gap-4">
      {COLOR_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          aria-label={`цвет ${preset.id}`}
          aria-pressed={value.id === preset.id}
          onClick={() => onChange(preset)}
          style={{
            background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
          }}
          className={`h-9 w-9 rounded-full border border-ink/15 ${
            value.id === preset.id
              ? "outline-solid outline-2 outline-offset-2 outline-lime"
              : ""
          }`}
        />
      ))}
    </div>
  );
}
