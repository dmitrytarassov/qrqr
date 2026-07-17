import { COLOR_PRESETS } from "../../state/settings";

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPresets({ value, onChange }: Props) {
  return (
    <div className="flex gap-4">
      {COLOR_PRESETS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`цвет ${color}`}
          aria-pressed={value === color}
          onClick={() => onChange(color)}
          style={{ backgroundColor: color }}
          className={`h-9 w-9 rounded-full border border-ink/15 ${
            value === color
              ? "outline-solid outline-2 outline-offset-2 outline-lime"
              : ""
          }`}
        />
      ))}
    </div>
  );
}
