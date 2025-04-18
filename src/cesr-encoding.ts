import { decodeBase64Int, decodeBase64Url, encodeBase64Int, encodeBase64Url } from "./base64.ts";
import type { CodeSize } from "./codes.ts";
import { MatterSize } from "./codes.ts";

function padNumber(num: number, length: number) {
  return num.toString().padStart(length, "0");
}

export type FrameType = "json" | "indexer" | "matter" | "counter_10" | "counter_20";

export interface Frame {
  type: FrameType;
  code: string;
  soft: string;
  count: number;
  text: string;
  raw: Uint8Array;
}

function prepad(raw: Uint8Array, length: number): Uint8Array {
  if (raw.byteLength === length) {
    return raw;
  }

  const padded = new Uint8Array(length + raw.byteLength);
  padded.set(raw, length);
  return padded;
}

function findCode(source: Uint8Array, table: Record<string, CodeSize>): CodeSize | null {
  let prefix = "";
  let size: CodeSize | null = null;
  const decoder = new TextDecoder();

  while (!size) {
    if (source.length < prefix.length + 1) {
      return null;
    }

    // TODO: Table holds the information about longest code, so we should look it up from there.
    if (prefix.length >= 5) {
      throw new Error("Expected frame");
    }

    prefix = decoder.decode(source.slice(0, prefix.length + 1));
    size = table[prefix];
  }

  return size;
}

export interface DecodeResult {
  frame: Frame | null;
  n: number;
}

export function decode(input: Uint8Array | string, table: Record<string, CodeSize> = MatterSize): DecodeResult {
  const source = typeof input === "string" ? new TextEncoder().encode(input) : input;

  const code = findCode(source, table);
  if (!code) {
    return { frame: null, n: 0 };
  }

  const decoder = new TextDecoder();
  const soft = decoder.decode(source.slice(code.hs, code.hs + code.ss));
  const size = code.fs ?? code.hs + code.ss + decodeBase64Int(soft) * 4;

  if (source.length < size) {
    return { frame: null, n: 0 };
  }

  const qb64 = decoder.decode(source.slice(0, size));
  const padSize = (code.hs + code.ss) % 4;
  const leadSize = code.ls ?? 0;
  const raw = decodeBase64Url("A".repeat(padSize) + qb64.slice(code.hs + code.ss, size)).slice(padSize + leadSize);

  return {
    frame: {
      type: code.type as FrameType,
      code: code.prefix,
      soft,
      count: soft ? decodeBase64Int(soft) : 0,
      text: qb64,
      raw,
    },
    n: size,
  };
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
export function encodeText(code: string, raw: Uint8Array, table: Record<string, CodeSize> = MatterSize): string {
  if (!(raw instanceof Uint8Array)) {
    throw new Error(`Input must be an Uint8Array`);
  }

  const size = table[code];

  if (!size) {
    throw new Error(`Unable to find code table for ${code}`);
  }

  const leadSize = size.ls ?? 0;
  const padSize = (3 - ((raw.byteLength + leadSize) % 3)) % 3;
  const padded = prepad(raw, padSize + leadSize);
  const soft = size.ss > 0 ? encodeBase64Int(padded.byteLength / 3, size.ss) : "";

  return `${code}${soft}${encodeBase64Url(padded).slice(padSize)}`;
}

const cesr = {
  encode: encodeText,
  decode,
  encodeDate,
};

export default cesr;
