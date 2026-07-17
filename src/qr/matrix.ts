import qrcode from "qrcode-generator";

// дефолтный кодировщик обрезает символы до одного байта — кириллица и эмодзи ломаются
qrcode.stringToBytes = (s: string) => Array.from(new TextEncoder().encode(s));

export type Matrix = boolean[][];
export type EcLevel = "M" | "H";

export function buildMatrix(text: string, ecLevel: EcLevel): Matrix | null {
  try {
    const qr = qrcode(0, ecLevel);
    qr.addData(text, "Byte");
    qr.make();
    const count = qr.getModuleCount();
    return Array.from({ length: count }, (_, row) =>
      Array.from({ length: count }, (_, col) => qr.isDark(row, col)),
    );
  } catch {
    return null;
  }
}
