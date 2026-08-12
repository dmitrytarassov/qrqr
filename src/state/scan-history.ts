import { useCallback, useState } from "react";

export interface ScanEntry {
  text: string;
  at: number;
  // пользовательское имя записи; отсутствует, пока не задали
  name?: string;
}

const STORAGE_KEY = "qrqr.scan-history";
const MAX_ENTRIES = 20;

function load(): ScanEntry[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is ScanEntry =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as ScanEntry).text === "string" &&
        typeof (entry as ScanEntry).at === "number" &&
        (typeof (entry as ScanEntry).name === "string" ||
          (entry as ScanEntry).name === undefined),
    );
  } catch {
    return [];
  }
}

function save(entries: ScanEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // приватный режим или квота — история просто не переживёт перезагрузку
  }
}

// повторный скан того же текста поднимает запись наверх, а не дублирует,
// поэтому text уникален и служит ключом для удаления
export function useScanHistory() {
  const [entries, setEntries] = useState<ScanEntry[]>(load);

  const update = useCallback((next: (prev: ScanEntry[]) => ScanEntry[]) => {
    setEntries((prev) => {
      const result = next(prev);
      save(result);
      return result;
    });
  }, []);

  const add = useCallback(
    (text: string) => {
      update((prev) => {
        // повторный скан не должен терять данное пользователем имя
        const name = prev.find((entry) => entry.text === text)?.name;
        return [
          { text, at: Date.now(), ...(name ? { name } : {}) },
          ...prev.filter((entry) => entry.text !== text),
        ].slice(0, MAX_ENTRIES);
      });
    },
    [update],
  );

  const rename = useCallback(
    (text: string, name: string) => {
      const trimmed = name.trim();
      update((prev) =>
        prev.map((entry) =>
          entry.text === text
            ? trimmed
              ? { ...entry, name: trimmed }
              : { text: entry.text, at: entry.at }
            : entry,
        ),
      );
    },
    [update],
  );

  const remove = useCallback(
    (text: string) => {
      update((prev) => prev.filter((entry) => entry.text !== text));
    },
    [update],
  );

  const clear = useCallback(() => update(() => []), [update]);

  return { entries, add, rename, remove, clear };
}
