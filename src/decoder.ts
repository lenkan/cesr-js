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

export interface ResolvedCodeSize extends CodeSize {
  os: number;
  ls: number;
  xs: number;
  cs: number;
  ms: number;
}

export type CodeTable = Record<string, CodeSize>;

function resolveCodeSize(size: CodeSize): ResolvedCodeSize {
  const cs = size.hs + size.ss;
  const ms = size.ss - (size.os ?? 0);
  const os = size.os ?? 0;
  const ls = size.ls ?? 0;
  const xs = size.xs ?? 0;

  return {
    hs: size.hs,
    fs: size.fs,
    ss: size.ss,
    os,
    ls,
    xs,
    cs,
    ms,
  };
}

export interface ReadResult {
  frame: Required<FrameData> | null;
  n: number;
}

export class Decoder {
  #sizes = new Map<string, ResolvedCodeSize>();
  #hards = new Map<number, number>();
  #counters = new Map<number, number>();

  constructor(table: CodeTable) {
    for (const [code, entry] of Object.entries(table)) {
      if (this.#sizes.has(code)) {
        throw new Error(`Duplicate code ${code} in table`);
      }

      this.#sizes.set(code, resolveCodeSize(entry));

      if (code.startsWith("-")) {
        const charCode = code.charCodeAt(1);
        const value = this.#counters.get(charCode);

        if (value !== undefined && value !== entry.hs) {
          throw new Error(`Duplicate hard size for ${code} in table`);
        }

        this.#counters.set(charCode, entry.hs);
      } else {
        const charCode = code.charCodeAt(0);
        const value = this.#hards.get(charCode);

        if (value !== undefined && value !== entry.hs) {
          throw new Error(`Duplicate hard size for ${code} in table`);
        }

        this.#hards.set(charCode, entry.hs);
      }
    }
  }

  getHardSize(input: Uint8Array): number {
    if (input[0] === 45) {
      const value = this.#counters.get(input[1]);

      if (value === undefined) {
        throw new Error(`Invalid character in input (${input[1]})`);
      }

      return value;
    }

    const value = this.#hards.get(input[0]);

    if (value === undefined) {
      throw new Error(`Invalid character in input (${input[0]})`);
    }

    return value;
  }

  getCodeSize(input: Uint8Array, hs?: number): ResolvedCodeSize {
    hs = hs ?? this.getHardSize(input);

    if (input.length < hs) {
      throw new Error(`Input too short for code size (${input.length} < ${hs})`);
    }

    const decoder = new TextDecoder();
    const code = decoder.decode(input.slice(0, hs));
    const size = this.#sizes.get(code);

    if (!size) {
      throw new Error(`Unknown code ${code}`);
    }

    return size;
  }

  getFullSize(input: Uint8Array, _size?: CodeSize): number {
    const decoder = new TextDecoder();
    const size = resolveCodeSize(_size ?? this.getCodeSize(input));
    if (input.length < size.cs) {
      throw new Error(`Input too short for code size (${input.length} < ${size.cs})`);
    }

    const soft = decodeBase64Int(decoder.decode(input.slice(size.hs, size.cs)));
    const fs = size.fs > 0 ? size.fs : size.cs + soft * 4;

    return fs;
  }

  read(input: Uint8Array): ReadResult {
    if (input.length < 2) {
      return { frame: null, n: 0 };
    }

    const hs = this.getHardSize(input);
    if (input.length < hs) {
      return { frame: null, n: 0 };
    }

    const size = this.getCodeSize(input, hs);
    if (input.length < size.cs) {
      return { frame: null, n: 0 };
    }

    const fs = this.getFullSize(input, size);
    if (input.length < fs) {
      return { frame: null, n: 0 };
    }

    return { frame: this.decode(input, size), n: fs };
  }

  decode(input: Uint8Array | string, _size?: CodeSize): Required<FrameData> {
    if (typeof input === "string") {
      input = new TextEncoder().encode(input);
    }

    const size = resolveCodeSize(_size ?? this.getCodeSize(input));

    const decoder = new TextDecoder();
    const fs = this.getFullSize(input, size);
    if (input.length < fs) {
      throw new Error(`Input too short for code size (${input.length} < ${fs})`);
    }

    const ls = size.ls ?? 0;
    const ps = (size.hs + size.ss) % 4;
    const hard = decoder.decode(input.slice(0, size.hs));
    const soft0 = decodeBase64Int(decoder.decode(input.slice(size.hs, size.hs + size.ms)));
    const soft1 = decodeBase64Int(decoder.decode(input.slice(size.hs + size.ms, size.hs + size.ms + size.os)));

    const padding = "A".repeat(ps);
    const text = decoder.decode(input.slice(0, fs));
    const rawtext = padding + text.slice(size.cs, fs);

    const raw = decodeBase64Url(rawtext).slice(ps + ls);
    return { code: hard, count: soft0, index: soft0, ondex: soft1, raw };
  }
}
