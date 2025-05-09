import { encodeBase64Int, encodeBase64Url } from "./base64.ts";
import { decodeBase64Int, decodeBase64Url } from "./base64.ts";

export interface FrameData {
  code: string;
  raw?: Uint8Array;
  count?: number;
  index?: number;
  ondex?: number;
}

function prepadBytes(raw: Uint8Array, length: number): Uint8Array {
  if (raw.byteLength === length) {
    return raw;
  }

  const padded = new Uint8Array(length + raw.byteLength);
  padded.set(raw, length);
  return padded;
}

export function encode(frame: FrameData, table: CodeTable): string {
  const size = table.sizes[frame.code];

  if (!size) {
    throw new Error(`Unable to find code table for ${frame.code}`);
  }

  const raw = frame.raw ?? new Uint8Array(0);
  const leadSize = size.ls ?? 0;
  const padSize = (3 - ((raw.byteLength + leadSize) % 3)) % 3;
  const padded = prepadBytes(raw, padSize + leadSize);
  const ms = (size.ss ?? 0) - (size.os ?? 0);
  const os = size.os ?? 0;

  const soft = ms ? encodeBase64Int(frame.count ?? frame.index ?? padded.byteLength / 3, ms) : "";
  const other = os ? encodeBase64Int(frame.ondex ?? 0, os ?? 0) : "";

  return `${frame.code}${soft}${other}${encodeBase64Url(padded).slice(padSize)}`;
}

export interface CodeSize {
  hs: number;
  fs: number;
  ss: number;
  os?: number;
  ls?: number;
  xs?: number;
}

export interface CodeTable {
  sizes: Record<string, CodeSize>;
  hards: Record<string, number>;
}

export interface DecodeResult {
  frame: Required<FrameData> | null;
  n: number;
}

function findHardSize(input: Uint8Array, table: CodeTable): number {
  const decoder = new TextDecoder();
  const start = input[0] === 45 ? decoder.decode(input.slice(0, 2)) : decoder.decode(input.slice(0, 1));
  const hs = table.hards[start];

  if (hs === undefined) {
    throw new Error(`Invalid first character in input (${start})`);
  }

  return hs;
}

export function decode(input: Uint8Array | string, table: CodeTable): Required<FrameData> {
  const result = read(input, table);

  if (result.frame === null) {
    throw new Error("Not enough data in input");
  }

  return result.frame;
}

export function read(input: Uint8Array | string, table: CodeTable): DecodeResult {
  if (typeof input === "string") {
    input = new TextEncoder().encode(input);
  }

  const decoder = new TextDecoder();

  if (input.length < 0) {
    return { frame: null, n: 0 };
  }

  const hs = findHardSize(input, table);

  if (input.length < hs) {
    return { frame: null, n: 0 };
  }

  const hard = decoder.decode(input.slice(0, hs));
  const size = table.sizes[hard];

  if (!size) {
    throw new Error(`Unknown code ${hard}`);
  }

  const cs = size.hs + size.ss;
  if (input.length < cs) {
    return { frame: null, n: 0 };
  }

  const soft = decodeBase64Int(decoder.decode(input.slice(size.hs, cs)));
  const fs = size.fs > 0 ? size.fs : cs + soft * 4;

  if (input.length < fs) {
    return { frame: null, n: 0 };
  }

  const ls = size.ls ?? 0;
  const ps = (size.hs + size.ss) % 4;
  const ms = size.ss - (size.os ?? 0);
  const os = size.os ?? 0;
  const soft0 = decodeBase64Int(decoder.decode(input.slice(size.hs, size.hs + ms)));
  const soft1 = decodeBase64Int(decoder.decode(input.slice(size.hs + ms, size.hs + ms + os)));

  const padding = "A".repeat(ps);
  const text = decoder.decode(input.slice(0, fs));
  const rawtext = padding + text.slice(cs, fs);

  const raw = decodeBase64Url(rawtext).slice(ps + ls);
  return { frame: { code: hard, count: soft0, index: soft0, ondex: soft1, raw }, n: fs };
}
