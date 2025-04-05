import { decodeBase64Url, encodeBase64Int, encodeBase64Url } from "./base64.ts";
import type { MatterCodeSize } from "./codes.ts";
import { MatterSize } from "./codes.ts";

function padNumber(num: number, length: number) {
  return num.toString().padStart(length, "0");
}

/**
 * Represents the Raw domain
 */
export interface Raw {
  code: string;
  buffer: Uint8Array;
}

export function decode(text: string): Raw {
  let i = 0;
  let code = "";
  let size: MatterCodeSize | null = null;

  while (!size && i <= 4) {
    code = text.slice(0, i);
    size = MatterSize[code] ?? null;
    ++i;
  }

  if (!size) {
    throw new Error(`Unable to find code table for ${text}`);
  }

  const padSize = (size.hs + size.ss) % 4;
  const padding = "A".repeat(padSize);
  const paddedRaw = decodeBase64Url(padding + text.substring(size.hs + size.ss));
  const buffer = paddedRaw.slice(padSize + (size.ls ?? 0));
  return { code, buffer };
}

export function encodeDate(date: Date): string {
  if (date.toString() === "Invalid Date") {
    throw new Error("Invalid date");
  }

  const YYYY = date.getFullYear();
  const MM = padNumber(date.getUTCMonth() + 1, 2);
  const dd = padNumber(date.getUTCDate(), 2);
  const hh = padNumber(date.getUTCHours(), 2);
  const mm = padNumber(date.getUTCMinutes(), 2);
  const ss = padNumber(date.getUTCSeconds(), 2);
  const ms = padNumber(date.getUTCMilliseconds(), 3);

  const format = `${YYYY}-${MM}-${dd}T${hh}c${mm}c${ss}d${ms}000p00c00`;
  return `1AAG${format}`;
}

function prepad(raw: Uint8Array, length: number): Uint8Array {
  const padded = new Uint8Array(length + raw.byteLength);
  padded.set(raw, length);
  return padded;
}

export function encode(code: string, raw: Uint8Array): string {
  if (!(raw instanceof Uint8Array)) {
    throw new Error(`Input must be an Uint8Array`);
  }

  const size = MatterSize[code];

  if (!size) {
    throw new Error(`Unable to find code table for ${code}`);
  }

  if (size.fs === null) {
    const padded = prepad(raw, size.ls);
    const soft = encodeBase64Int(padded.length / 3, size.ss);
    return `${code}${soft}${encodeBase64Url(padded)}`;
  }

  const padSize = (3 - ((raw.byteLength + size.ls) % 3)) % 3;
  const padded = prepad(raw, padSize + size.ls);

  return code + encodeBase64Url(padded).slice(padSize);
}

const cesr = {
  encode,
  decode,
  encodeDate,
};

export default cesr;
