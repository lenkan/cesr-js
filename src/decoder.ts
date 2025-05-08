import { decodeBase64Int, decodeBase64Url } from "./base64.ts";
import type { FrameData } from "./frame.ts";

export interface CodeSize {
  hs: number;
  fs: number;
  ss: number;
  os?: number;
  ls?: number;
  xs?: number;
}

export type CodeTable = Record<string, CodeSize>;
export type CodeSchemeTable = Record<string, number>;

export interface DecodeResult {
  frame: Required<FrameData> | null;
  n: number;
}

export interface DecodeTable {
  hards: CodeSchemeTable;
  sizes: CodeTable;
}

function findHardSize(input: Uint8Array, table: DecodeTable): number {
  const decoder = new TextDecoder();
  const start = input[0] === 45 ? decoder.decode(input.slice(0, 2)) : decoder.decode(input.slice(0, 1));
  const hs = table.hards[start];

  if (hs === undefined) {
    throw new Error(`Invalid first character in input (${start})`);
  }

  return hs;
}

export function decode(input: Uint8Array | string, table: DecodeTable): Required<FrameData> {
  const result = read(input, table);

  if (result.frame === null) {
    throw new Error("Not enough data in input");
  }

  return result.frame;
}

export function read(input: Uint8Array | string, table: DecodeTable): DecodeResult {
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
    throw new Error(`Unknown code ${hard}, ${Object.keys(table.sizes)}`);
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
