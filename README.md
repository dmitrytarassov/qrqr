# qrqr

QR code generator. One screen, zero steps, instant result.

paste it. save it. done.

## What it does

- **No "Generate" button.** The QR code rebuilds in real time as you type,
  with a staggered module animation (~180 ms).
- **Tap/click the code to customize** — settings live in a bottom sheet
  (mobile) or a popover (desktop), never on the main screen:
  - module color — 5 presets;
  - module shape — square / rounded / dots (finder patterns are drawn
    separately so every shape stays scannable);
  - center logo — pick from gallery, or drag & drop straight onto the
    code on desktop. Error correction bumps to level H automatically.
- **Mobile-first sharing.** The primary action is the Web Share API with
  a PNG file, falling back to download. Long-press the code for the
  native "Save image" (the QR is rendered into an `<img>` for exactly
  this reason).
- **Export**: PNG · SVG · Copy (PNG into the clipboard, with a burst of
  tiny lime confetti).
- **Never empty.** While the input is blank, the code quietly cycles
  through a set of hidden words every 3 seconds — scan it for an easter
  egg.
- **Dark theme** via `prefers-color-scheme`, no toggle. The QR itself is
  always dark-on-white — inverted codes scan poorly.
- Micro-details: subtle 3D tilt following the cursor, modules flash in
  the accent color on hover, UTF-8 input (Cyrillic and emoji encode
  correctly).

Full design spec (in Russian): [docs/DESIGN.md](docs/DESIGN.md).

## Stack

React 19 + TypeScript + Vite + Tailwind CSS 4, running on
[Bun](https://bun.sh). QR matrices come from the zero-dependency
[`qrcode-generator`](https://github.com/kazuhikoarase/qrcode-generator);
rendering, shapes, animation and exports are custom.

## Getting started

```sh
bun install
bun run dev      # dev server
bun run build    # tsc + production build into dist/
bun run lint
```

## Project structure

```
src/
├── qr/          # pure logic, no React: matrix building, canvas renderer
│                # (shapes, colors, logo), SVG export, stagger animation
├── components/  # Header, TextInput, QrCard, ActionsBar, settings/
├── hooks/       # autogrow, media query, tilt
├── lib/         # share, clipboard, download, image, confetti
└── state/       # code settings (presets, reducer)
```

## License

[MIT](LICENSE).

"QR Code" is a registered trademark of DENSO WAVE INCORPORATED.
