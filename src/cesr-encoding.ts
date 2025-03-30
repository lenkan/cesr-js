import { decodeBase64Int, decodeBase64Url, encodeBase64Int, encodeBase64Url } from "./base64.ts";
import type { IndexerCodeSize, MatterCodeSize } from "./codes.ts";
import { IndexCode, IndexerSize, MatterCode, MatterSize } from "./codes.ts";

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

function findPrimitiveCode(text: string): [string, MatterCodeSize] {
  let i = 0;
  let code = "";
  let size: MatterCodeSize | null = null;

  while (!size && i <= 4) {
    code = text.slice(0, i);
    size = MatterSize[code];
    ++i;
  }

  if (!size) {
    throw new Error(`Unable to find code table for ${text}`);
  }

  return [code, size];
}

function findIndexCode(text: string): [string, IndexerCodeSize] {
  let i = 0;
  let code = "";
  let size: IndexerCodeSize | null = null;

  while (!size && i <= 4) {
    code = text.slice(0, i);
    size = IndexerSize[text.slice(0, i)];
    ++i;
  }

  if (!size) {
    throw new Error(`Unable to find code table for ${text}`);
  }

  return [code, size];
}

export function decode(text: string): Raw {
  const [code, size] = findPrimitiveCode(text);

  if (!size) {
    throw new Error(`Unable to find code table for ${text}`);
  }

  const padSize = (size.hs + size.ss) % 4;
  const padding = "A".repeat(padSize);
  const paw = decodeBase64Url(padding + text.substring(size.hs + size.ss));
  const buffer = paw.slice(padSize + (size.ls ?? 0));
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
  const ms = padNumber(date.getMilliseconds(), 3);

  const format = `${YYYY}-${MM}-${dd}T${hh}c${mm}c${ss}d${ms}000p00c00`;
  return `1AAG${format}`;
}

export function encode(code: string, raw: Uint8Array): string {
  const both = code;
  const rs = raw.byteLength;
  const size = MatterSize[code];
  if (!size) {
    throw new Error(`Unable to find code table for ${code}`);
  }

  const { hs, ss, xs, fs } = size;
  const ls = size.ls ?? 0;
  const cs = hs + ss;

  let full: string;

  if (!fs) {
    if ((ls + rs) % 3 !== 0 || cs % 4 !== 0) {
      throw new Error(
        `Invalid full code=${both} with variable raw size=${rs} given cs=${cs}, hs=${hs}, ss=${ss}, fs=${fs}, and ls=${ls}.`,
      );
    }

    const paddedRaw = new Uint8Array(ls + rs);
    paddedRaw.set(raw, ls);
    full = both + encodeBase64Url(paddedRaw);
  } else {
    const ps = (3 - ((rs + ls) % 3)) % 3;

    if (ps !== cs % 4) {
      throw new Error(
        `Invalid full code=${both} with fixed raw size=${rs} given cs=${cs}, hs=${hs}, ss=${ss}, fs=${fs}, and ls=${ls}.`,
      );
    }

    const paddedRaw = new Uint8Array(ps + ls + rs);
    paddedRaw.set(raw, ps + ls);
    full = both + encodeBase64Url(paddedRaw).slice(ps);
  }

  if (full.length % 4 !== 0 || (fs && full.length !== fs)) {
    throw new Error(
      `Invalid full size given code=${both} with raw size=${rs}, cs=${cs}, hs=${hs}, ss=${ss}, xs=${xs}, fs=${fs}, and ls=${ls}.`,
    );
  }

  return full;
}

function resolveIndexCode(primitiveCode: string): [string, IndexerCodeSize] {
  switch (primitiveCode) {
    case MatterCode.Ed25519_Sig:
      return [IndexCode.Ed25519_Sig, IndexerSize[IndexCode.Ed25519_Sig]];
    case MatterCode.Ed448_Sig:
      return [IndexCode.Ed448_Sig, IndexerSize[IndexCode.Ed448_Sig]];
  }

  throw new Error(`Unable to find indexed code for '${primitiveCode}'`);
}

function resolvePrimitiveCode(indexCode: string): [string, MatterCodeSize] {
  switch (indexCode) {
    case IndexCode.Ed25519_Sig:
      return [MatterCode.Ed25519_Sig, MatterSize[IndexCode.Ed25519_Sig]];
    case IndexCode.Ed448_Sig:
      return [MatterCode.Ed448_Sig, MatterSize[IndexCode.Ed448_Sig]];
  }

  throw new Error(`Unable to find primitive code for '${indexCode}'`);
}

/**
 * Converts a cryptographic primitive to indexed material
 */
export function index(text: string, index: number): string {
  const [code, size] = findPrimitiveCode(text);
  const [indexCode, indexCodeSize] = resolveIndexCode(code);

  return indexCode + encodeBase64Int(index, indexCodeSize.ss) + text.slice(size.hs + size.ss);
}

export interface Indexed {
  value: string;
  index: number;
}

/**
 * Converts indexed material to primitive and index
 */
export function deindex(text: string): Indexed {
  const [indexCode, indexCodeSize] = findIndexCode(text);
  const [primitiveCode] = resolvePrimitiveCode(indexCode);

  const index = decodeBase64Int(text.slice(indexCodeSize.hs, indexCodeSize.ss));
  const value = primitiveCode + text.slice(indexCodeSize.hs + indexCodeSize.ss);

  return {
    index,
    value,
  };
}

const cesr = {
  encode,
  decode,
  index,
  deindex,
  encodeDate,
};

export default cesr;
