import { encodeBase64Int, encodeBase64Url } from "./base64.ts";
import type { CodeSize } from "./codes.ts";
import { MatterSize } from "./codes.ts";

function padNumber(num: number, length: number) {
  return num.toString().padStart(length, "0");
}

function prepadBytes(raw: Uint8Array, length: number): Uint8Array {
  if (raw.byteLength === length) {
    return raw;
  }

  const padded = new Uint8Array(length + raw.byteLength);
  padded.set(raw, length);
  return padded;
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

/**
 * Encodes the provided raw data into the CESR Text domain.
 */
export function encodeCounter(code: string, count: number, table: Record<string, CodeSize>): string {
  const size = table[code];

  if (!size) {
    throw new Error(`Unable to find code table for ${code}`);
  }

  if (size.ss === 0) {
    throw new Error(`Invalid soft size (${size.ss}) for count code`);
  }

  const soft = encodeBase64Int(count, size.ss);
  return `${code}${soft}`;
}

/**
 * Encodes the provided raw data into the CESR Text domain.
 */
export function encodeIndexer(code: string, index: number, raw: Uint8Array, table: Record<string, CodeSize>): string {
  const size = table[code];

  if (!size) {
    throw new Error(`Unable to find code table for ${code}`);
  }

  const leadSize = size.ls ?? 0;
  const padSize = (3 - ((raw.byteLength + leadSize) % 3)) % 3;
  const padded = prepadBytes(raw, padSize + leadSize);
  const soft = encodeBase64Int(index, size.ss);

  return `${code}${soft}${encodeBase64Url(padded).slice(padSize)}`;
}

/**
 * Encodes the provided raw data into the CESR Text domain.
 */
export function encode(code: string, raw: Uint8Array, table: Record<string, CodeSize> = MatterSize): string {
  if (!(raw instanceof Uint8Array)) {
    throw new Error(`Input must be an Uint8Array`);
  }

  const size = table[code];

  if (!size) {
    throw new Error(`Unable to find code table for ${code}`);
  }

  const leadSize = size.ls ?? 0;
  const padSize = (3 - ((raw.byteLength + leadSize) % 3)) % 3;
  const padded = prepadBytes(raw, padSize + leadSize);
  const soft = size.ss > 0 ? encodeBase64Int(padded.byteLength / 3, size.ss) : "";

  return `${code}${soft}${encodeBase64Url(padded).slice(padSize)}`;
}
