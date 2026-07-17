import type { ModuleShape } from "../../state/settings";

const SHAPES: { id: ModuleShape; label: string }[] = [
  { id: "square", label: "квадрат" },
  { id: "rounded", label: "скруглённый" },
  { id: "dots", label: "точки" },
];

interface Props {
  value: ModuleShape;
  onChange: (shape: ModuleShape) => void;
}

export function ShapePicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {SHAPES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-[13px] transition-colors ${
            value === id
              ? "text-ink outline-solid outline-2 -outline-offset-1 outline-lime"
              : "text-muted hover:text-ink"
          }`}
        >
          <ShapeIcon shape={id} />
          {label}
        </button>
      ))}
    </div>
  );
}

function ShapeIcon({ shape }: { shape: ModuleShape }) {
  const cells: [number, number][] = [
    [1, 1],
    [8, 1],
    [1, 8],
    [8, 8],
  ];
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="currentColor"
      aria-hidden
    >
      {cells.map(([x, y]) =>
        shape === "dots" ? (
          <circle key={`${x}-${y}`} cx={x + 3} cy={y + 3} r={3} />
        ) : (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={6}
            height={6}
            rx={shape === "rounded" ? 1.8 : 0}
          />
        ),
      )}
    </svg>
  );
}
