import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { ActionsBar } from "./components/ActionsBar";
import { Header } from "./components/Header";
import { QrCard } from "./components/QrCard";
import { ScannerSheet } from "./components/ScannerSheet";
import { TextInput } from "./components/TextInput";
import { SettingsContent } from "./components/settings/SettingsContent";
import { SettingsPopover } from "./components/settings/SettingsPopover";
import { SettingsSheet } from "./components/settings/SettingsSheet";
import { useMediaQuery } from "./hooks/use-media-query";
import { copyPngToClipboard } from "./lib/clipboard";
import { downloadBlob } from "./lib/download";
import { fileToLogoDataUrl } from "./lib/image";
import { getPlatform } from "./lib/platform";
import { buildMatrix, type Matrix } from "./qr/matrix";
import { canvasToBlob } from "./qr/render-canvas";
import { renderSvg } from "./qr/render-svg";
import { defaultSettings, settingsReducer } from "./state/settings";

// пустое состояние: слова не показываем, но кодируем в qr — пасхалка для тех, кто отсканирует
const PLACEHOLDER_WORDS = [
  "qrqr",
  "вставил. скачал. всё.",
  "ноль шагов",
  "живой код",
  "без рекламы",
  "сканируй меня",
  "жги",
  "просто ссылка",
];
const PLACEHOLDER_ROTATE_MS = 3000;

export default function App() {
  const [text, setText] = useState("");
  const [settings, dispatch] = useReducer(settingsReducer, defaultSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const lastGood = useRef<Matrix | null>(null);
  const isDesktop = useMediaQuery("(min-width: 900px)");

  const trimmed = text.trim();
  const matrix = useMemo(
    () => (trimmed ? buildMatrix(trimmed, settings.logo ? "H" : "M") : null),
    [trimmed, settings.logo],
  );
  if (matrix) lastGood.current = matrix;
  const overflow = Boolean(trimmed) && !matrix;

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_WORDS.length);
    }, PLACEHOLDER_ROTATE_MS);
    return () => clearInterval(id);
  }, []);
  const placeholder = useMemo(
    () => buildMatrix(PLACEHOLDER_WORDS[placeholderIndex], "M") ?? [[true]],
    [placeholderIndex],
  );

  const display = matrix ?? (trimmed ? lastGood.current : null) ?? placeholder;
  const isPlaceholder = display === placeholder;

  const handleShare = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    void getPlatform().then((platform) =>
      platform.share({ canvas, text: trimmed }),
    );
  };
  const handlePng = () => {
    const canvas = canvasRef.current;
    if (canvas)
      void canvasToBlob(canvas).then((blob) => downloadBlob(blob, "qrqr.png"));
  };
  const handleSvg = () => {
    if (isPlaceholder) return;
    const svg = renderSvg(display, {
      color: settings.color,
      shape: settings.shape,
      logo: settings.logo,
    });
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qrqr.svg");
  };
  const handleCopy = () => {
    const canvas = canvasRef.current;
    return canvas ? copyPngToClipboard(canvas) : Promise.resolve(false);
  };
  // useCallback: сканер держит камеру в эффекте с этой зависимостью,
  // нестабильная ссылка перезапускала бы стрим на каждом тике плейсхолдера
  const handleScanResult = useCallback((scanned: string) => {
    setText(scanned);
    setScannerOpen(false);
  }, []);
  const handleLogoFile = (file: File) => {
    void fileToLogoDataUrl(file).then(
      (logo) => dispatch({ type: "logo", logo }),
      () => undefined,
    );
  };

  const overflowNote = overflow && (
    <p className="text-[11px] text-faint">
      слишком длинно для одного QR — показан предыдущий
    </p>
  );

  if (isDesktop) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden">
        <Header />
        <main className="grid min-h-0 flex-1 place-items-center px-8">
          <div className="grid w-full max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-16">
            <div className="flex min-w-0 flex-col gap-8">
              <div className="flex flex-col gap-2">
                <TextInput
                  value={text}
                  onChange={setText}
                  onScan={() => setScannerOpen(true)}
                />
                {overflowNote}
              </div>
              <ActionsBar
                variant="desktop"
                disabled={isPlaceholder}
                onShare={handleShare}
                onPng={handlePng}
                onSvg={handleSvg}
                onCopy={handleCopy}
              />
              <p className="text-[12px] text-faint">
                обновляется, пока печатаешь · клик по коду — настройки
              </p>
            </div>
            <div ref={anchorRef} className="relative">
              <QrCard
                matrix={display}
                isPlaceholder={isPlaceholder}
                settings={settings}
                canvasRef={canvasRef}
                onOpenSettings={() => setSettingsOpen(true)}
                onLogoFile={handleLogoFile}
              />
              <SettingsPopover
                open={settingsOpen}
                anchorRef={anchorRef}
                onClose={() => setSettingsOpen(false)}
              >
                <SettingsContent settings={settings} dispatch={dispatch} />
              </SettingsPopover>
            </div>
          </div>
        </main>
        <ScannerSheet
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onResult={handleScanResult}
        />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      <div className="flex flex-col gap-2 px-5 pt-5">
        <TextInput
          value={text}
          onChange={setText}
          onScan={() => setScannerOpen(true)}
        />
        {overflowNote}
      </div>
      <main className="grid min-h-0 flex-1 place-items-center px-5 py-4 [container-type:size]">
        <QrCard
          matrix={display}
          isPlaceholder={isPlaceholder}
          settings={settings}
          canvasRef={canvasRef}
          onOpenSettings={() => setSettingsOpen(true)}
          onLogoFile={handleLogoFile}
        />
      </main>
      <footer className="px-5 pb-[calc(env(safe-area-inset-bottom)+14px)]">
        <ActionsBar
          variant="mobile"
          disabled={isPlaceholder}
          onShare={handleShare}
          onPng={handlePng}
          onSvg={handleSvg}
          onCopy={handleCopy}
        />
      </footer>
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <SettingsContent settings={settings} dispatch={dispatch} />
      </SettingsSheet>
      <ScannerSheet
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onResult={handleScanResult}
      />
    </div>
  );
}
