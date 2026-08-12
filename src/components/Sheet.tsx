import type { ReactNode } from "react";

interface Props {
  open: boolean;
  label: string;
  onClose: () => void;
  children: ReactNode;
}

export function Sheet({ open, label, onClose, children }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-40"
      role="dialog"
      aria-modal
      aria-label={label}
    >
      <div className="absolute inset-0 bg-bg/65" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-xl animate-[sheet-in_0.25s_ease] rounded-t-[18px] bg-panel px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-3">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line" />
        {children}
      </div>
    </div>
  );
}
