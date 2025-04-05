import { decodeBase64Url, encodeBase64Int, encodeBase64Url } from "./base64.ts";
import type { MatterCodeSize } from "./codes.ts";
import { MatterSize } from "./codes.ts";
import { parseVersion } from "./version.ts";

function padNumber(num: number, length: number) {
  return num.toString().padStart(length, "0");
}

interface CountFrame {
  type: "counter";
  count: number;
  code: string;
  text: string;
}

interface IndexedFrame {
  type: "indexer";
  code: string;
  text: string;
}

interface MatterFrame {
  type: "matter";
  code: string;
  text: string;
  raw: Uint8Array;
}

interface JsonFrame {
  type: "json";
  text: string;
}

type Frame = CountFrame | IndexedFrame | MatterFrame | JsonFrame;

/**
 * Represents the Raw domain
 */
export interface Raw {
  code: string;
  raw: Uint8Array;
}

function decodeJSON(input: Uint8Array): JsonFrame | null {
  const decoder = new TextDecoder();

  if (input.length < 23) {
    // throw new Error("Input too short");
    return null;
  }

  const version = parseVersion(decoder.decode(input.slice(0, 23)));
  if (input.length < version.size) {
    return null;
  }

  const payload = decoder.decode(input.slice(0, version.size));

  return {
    type: "json",
    text: payload,
  };
}

export function decode(input: string | Uint8Array): Frame | null {
  if (typeof input === "string") {
    return decode(new TextEncoder().encode(input));
  }

  let i = 0;
  let code = "";
  let size: MatterCodeSize | null = null;
  const tritet = input[0].toString(2).padStart(8, "0").slice(0, 3);

  switch (tritet) {
    case "011":
      return decodeJSON(input);
  }

  const decoder = new TextDecoder();

  while (!size && i <= 4) {
    code = decoder.decode(input.slice(0, i));
    size = MatterSize[code] ?? null;
    ++i;
  }

  console.log(tritet);

  if (!size) {
    throw new Error(`Unable to find code table for ${code}`);
  }

  const padSize = (size.hs + size.ss) % 4;
  // const padding = "A".repeat(padSize);
  // const qb64 =
  // const qb64 =
  // const start =
  // console.log(padSize);
  if (size.fs === null) {
    throw new Error(`Invalid frame size for code '${code}'`);
  }

  const text = decoder.decode(input.slice(0, size.fs));
  const paddedRaw = decodeBase64Url(decoder.decode(input.slice(size.hs + size.ss)));
  const buffer = paddedRaw.slice(padSize + (size.ls ?? 0));
  return { code, type: "matter", text, raw: buffer };
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
