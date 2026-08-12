import { useRef, useState, type MouseEvent } from "react";

import { burstConfetti } from "../lib/confetti";

interface Props {
  variant: "mobile" | "desktop";
  disabled: boolean;
  onShare: () => void;
  onSave: () => void;
  onPng: () => void;
  onSvg: () => void;
  onCopy: () => Promise<boolean>;
}

export function ActionsBar({
  variant,
  disabled,
  onShare,
  onSave,
  onPng,
  onSvg,
  onCopy,
}: Props) {
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const save = () => {
    onSave();
    setSaved(true);
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 1500);
  };

  const copy = async (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!(await onCopy())) return;
    burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    setCopied(true);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 1500);
  };

  const quiet =
    "rounded-xl border border-line px-4 py-2 text-[13px] text-muted transition-colors hover:border-lime-edge hover:text-ink disabled:pointer-events-none disabled:opacity-40";

  if (variant === "desktop") {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={save}
          className={quiet}
        >
          {saved ? "сохранено" : "Сохранить"}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onPng}
          className={quiet}
        >
          PNG
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onSvg}
          className={quiet}
        >
          SVG
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => void copy(e)}
          className={quiet}
        >
          {copied ? "скопировано" : "Copy"}
        </button>
      </div>
    );
  }

  const link =
    "text-[13px] text-muted transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={onShare}
          className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl bg-[#111110] py-4 text-[15px] font-medium text-[#FAFAF7] transition-opacity disabled:opacity-40 dark:border dark:border-white/10"
        >
          <ShareIcon />
          Поделиться
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={save}
          className="shrink-0 rounded-2xl border border-line px-5 text-[14px] text-muted transition-colors hover:border-lime-edge hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          {saved ? "сохранено" : "Сохранить"}
        </button>
      </div>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onPng}
          className={link}
        >
          PNG
        </button>
        <span className="text-faint">·</span>
        <button
          type="button"
          disabled={disabled}
          onClick={onSvg}
          className={link}
        >
          SVG
        </button>
        <span className="text-faint">·</span>
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => void copy(e)}
          className={link}
        >
          {copied ? "скопировано" : "Copy"}
        </button>
      </div>
      <p className="text-center text-[11px] text-faint">
        тап по коду — настройки
      </p>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C8FF00"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m7 8 5-5 5 5" />
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}
