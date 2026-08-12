import { useState } from "react";

import type { ScanEntry } from "../state/scan-history";

interface Props {
  entries: ScanEntry[];
  onPick: (text: string) => void;
  onRename: (text: string, name: string) => void;
  onRemove: (text: string) => void;
  onClear: () => void;
}

export function HistoryContent({
  entries,
  onPick,
  onRename,
  onRemove,
  onClear,
}: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  if (entries.length === 0)
    return <p className="py-6 text-center text-[13px] text-faint">пусто</p>;

  const startEdit = (entry: ScanEntry) => {
    setEditing(entry.text);
    setDraft(entry.name ?? "");
  };
  const commitEdit = (text: string) => {
    onRename(text, draft);
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <span className="text-[13px] text-muted">история</span>
      <ul className="flex max-h-[50dvh] flex-col gap-1 overflow-y-auto">
        {entries.map((entry) => (
          <li key={entry.text} className="flex items-center gap-2">
            {editing === entry.text ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => commitEdit(entry.text)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit(entry.text);
                  if (e.key === "Escape") setEditing(null);
                }}
                placeholder="имя записи"
                className="min-w-0 flex-1 rounded-lg bg-bg px-2 py-2 text-[16px] text-ink caret-lime outline-none placeholder:text-faint"
              />
            ) : (
              <button
                type="button"
                onClick={() => onPick(entry.text)}
                className="min-w-0 flex-1 truncate rounded-lg px-2 py-2 text-left transition-colors hover:bg-bg"
              >
                {entry.name ? (
                  <>
                    <span className="block truncate text-[14px] text-ink">
                      {entry.name}
                    </span>
                    <span className="block truncate font-mono text-[12px] text-faint">
                      {entry.text}
                    </span>
                  </>
                ) : (
                  <span className="block truncate font-mono text-[14px] text-ink">
                    {entry.text}
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => startEdit(entry)}
              aria-label={`переименовать «${entry.name ?? entry.text}»`}
              className="shrink-0 rounded-lg px-2 py-1 text-[13px] text-faint transition-colors hover:text-ink"
            >
              ✎
            </button>
            <button
              type="button"
              onClick={() => onRemove(entry.text)}
              aria-label={`удалить «${entry.name ?? entry.text}»`}
              className="shrink-0 rounded-lg px-2 py-1 text-[15px] text-faint transition-colors hover:text-ink"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClear}
        className="self-start text-[13px] text-faint underline-offset-4 transition-colors hover:text-ink hover:underline"
      >
        очистить всё
      </button>
    </div>
  );
}
