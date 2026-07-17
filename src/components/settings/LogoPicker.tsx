import { useRef } from "react";

import { fileToLogoDataUrl } from "../../lib/image";

interface Props {
  logo: string | null;
  onChange: (logo: string | null) => void;
}

export function LogoPicker({ logo, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    try {
      onChange(await fileToLogoDataUrl(file));
    } catch {
      // битый файл — оставляем как было
    }
  };

  const buttonClass =
    "rounded-xl border border-line px-3 py-2 text-[13px] text-muted transition-colors hover:border-lime-edge hover:text-ink";

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {logo ? (
        <>
          <img
            src={logo}
            alt="логотип"
            className="h-9 w-9 rounded-lg border border-line bg-white object-contain p-0.5"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={buttonClass}
          >
            заменить
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            className={buttonClass}
          >
            убрать
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={buttonClass}
        >
          выбрать из галереи
        </button>
      )}
    </div>
  );
}
