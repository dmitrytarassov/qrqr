import { useRef } from "react";

import { useAutogrow } from "../hooks/use-autogrow";
import { readClipboardText } from "../lib/clipboard";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onScan: () => void;
}

export function TextInput({ value, onChange, onScan }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutogrow(ref, value);

  const paste = async () => {
    try {
      const text = await readClipboardText();
      if (text) onChange(text);
    } catch {
      // доступ к буферу не дали — молча остаёмся как есть
    }
    ref.current?.focus();
  };

  const clear = () => {
    onChange("");
    ref.current?.focus();
  };

  const buttonClass =
    "flex-1 rounded-xl border border-line py-2.5 text-[13px] text-muted transition-colors hover:border-lime-edge hover:text-ink";

  return (
    <div className="flex flex-col gap-3">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ссылка, текст, что угодно"
        rows={1}
        autoFocus
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        className="max-h-32 w-full resize-none [overflow-wrap:anywhere] bg-transparent font-mono text-[19px] leading-snug caret-lime outline-none placeholder:text-faint md:max-h-56 md:text-[32px]"
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => void paste()}
          className={buttonClass}
        >
          Вставить
        </button>
        {value !== "" && (
          <button type="button" onClick={clear} className={buttonClass}>
            Очистить
          </button>
        )}
        <button type="button" onClick={onScan} className={buttonClass}>
          Скан
        </button>
      </div>
    </div>
  );
}
