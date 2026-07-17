import { useEffect, type ReactNode, type RefObject } from "react";

interface Props {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
}

export function SettingsPopover({ open, anchorRef, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!anchorRef.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, anchorRef, onClose]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-label="настройки"
      className="absolute right-full top-1/2 z-30 mr-5 w-80 -translate-y-1/2 rounded-2xl border border-line bg-panel p-5 shadow-[0_8px_30px_rgba(17,17,16,0.08)]"
    >
      {children}
    </div>
  );
}
