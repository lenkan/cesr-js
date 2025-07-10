import { prepad, toArray } from "./array-utils.ts";
import { decodeBase64Int, decodeBase64Url, encodeBase64Int, encodeBase64Url } from "./encoding-base64.ts";
import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";
import { lshift } from "./shifting.ts";

export interface CodeSizeInit {
  hs: number;
  fs?: number;
  ss?: number;
  os?: number;
  ls?: number;
  xs?: number;
}

export type CodeTableInit = Record<string, CodeSizeInit>;

export interface CodeSize {
  hs: number;
  fs: number;
  ss: number;
  os: number;
  ls: number;
  xs: number;
}

export type Domain = "text" | "binary";

export interface CodeTableOptions {
  /**
   * Strict lookup rules - throws if codes are not in the provided table
   */
  strict?: boolean;
}

export interface FrameData {
  code: string;
  raw?: Uint8Array;
  count?: number;
  index?: number;
  ondex?: number;
  text?: string;
}

export interface ReadResult {
  /**
   * The frame, or null if there was not enough data in the input
   */
  frame: Required<FrameData> | null;

  /**
   * The number of bytes consumed from the input
   */
  n: number;
}

function resolveSize(init: CodeSizeInit): CodeSize {
  return {
    hs: init.hs,
    fs: init.fs ?? 0,
    ls: init.ls ?? 0,
    os: init.os ?? 0,
    ss: init.ss ?? 0,
    xs: init.xs ?? 0,
  };
}

export class CodeTable {
  #table: Record<string, CodeSize> = {};
  #hards: Record<string, number> = {};
  #strict: boolean;

  constructor(table: Record<string, CodeSizeInit>, options: CodeTableOptions = {}) {
    this.#strict = options.strict ?? false;

    for (const [key, value] of Object.entries(table)) {
      this.#hards[key.slice(0, 1)] = value.hs;
      this.#table[key] = resolveSize(value);
    }
  }

  /**
   * Finds the size table of a code
   * @param input The input to parse the code from
   */
  lookup(input: string | Uint8Array): CodeSize {
    if (typeof input !== "string") {
      input = decodeUtf8(input.slice(0, 4));
    }

    const hs = this.#hards[input.slice(0, 1)];
    const hard = input.slice(0, hs ?? 4);
    const size = this.#table[hard];

    if (size) {
      return size;
    }

    if (!this.#strict) {
      switch (hard.charAt(0)) {
        case "-":
          switch (hard.charAt(1)) {
            case "-":
              return resolveSize({ hs: 3, ss: 5, fs: 8 });
            case "_":
              return resolveSize({ hs: 5, ss: 3, fs: 8 });
            default:
              return resolveSize({ hs: 2, ss: 2, fs: 4 });
          }
      }
    }

    throw new Error(`Unknown code ${hard}`);
  }

  #encodeBinary(frame: FrameData): Uint8Array {
    const raw = frame.raw ?? new Uint8Array(0);

    // TODO: xs
    const size = this.lookup(frame.code);
    const cs = size.hs + size.ss;
    const ms = size.ss - size.os;
    const os = size.os;
    const n = Math.ceil((cs * 3) / 4);
    const soft = ms ? encodeBase64Int(frame.count ?? frame.index ?? (size.ls + raw.length) / 3, ms) : "";
    const other = os ? encodeBase64Int(frame.ondex ?? 0, os ?? 0) : "";
    const padding = 2 * (cs % 4);

    const bcode = toArray(lshift(decodeBase64Int(frame.code + soft + other), padding), n);
    const result = new Uint8Array(bcode.length + size.ls + raw.length);
    result.set(bcode, 0);
    result.set(raw, bcode.length + size.ls);

    return result;
  }

  #encodeText(frame: FrameData): Uint8Array {
    const size = this.lookup(frame.code);

    if (frame.code.length !== size.hs) {
      throw new Error(`Frame code ${frame.code} length ${frame.code.length} does not match expected size ${size.hs}`);
    }

    const ls = size.ls ?? 0;
    const ms = (size.ss ?? 0) - (size.os ?? 0);
    const os = size.os ?? 0;

    const raw = frame.raw ?? new Uint8Array(0);

    const padSize = (3 - ((raw.byteLength + ls) % 3)) % 3;
    const padded = prepad(raw, padSize + ls);

    const soft = ms ? encodeBase64Int(frame.count ?? frame.index ?? padded.byteLength / 3, ms) : "";
    const other = os ? encodeBase64Int(frame.ondex ?? 0, os ?? 0) : "";

    const result = `${frame.code}${soft}${other}${encodeBase64Url(padded).slice(padSize)}`;

    if (size.fs !== undefined && size.fs > 0 && result.length < size.fs) {
      throw new Error(`Encoded size ${result.length} does not match expected size ${size.fs}`);
    }

    return encodeUtf8(result);
  }

  encode(frame: FrameData, domain: Domain = "text"): Uint8Array {
    if (domain === "text") {
      return this.#encodeText(frame);
    }

    return this.#encodeBinary(frame);
  }

  decode(input: string | Uint8Array): Required<FrameData> {
    if (typeof input === "string") {
      input = encodeUtf8(input);
    }

    const result = this.read(input);

    if (result.frame === null) {
      throw new Error("Not enough data in input");
    }

    return result.frame;
  }

  /**
   * Tries to read a frame from the input. Returns an object with the frame and the number of bytes read.
   * @param input The input. May be longer than one frame, in which case only the first frame is returned.
   */
  read(input: Uint8Array): ReadResult {
    if (input.length < 4) {
      return { frame: null, n: 0 };
    }

    const size = this.lookup(input);

    if (!size) {
      throw new Error(`Unknown code ${input}`);
    }

    const ss = size.ss ?? 0;
    const cs = size.hs + ss;
    if (input.length < cs) {
      return { frame: null, n: 0 };
    }

    const ls = size.ls ?? 0;
    const ps = (size.hs + ss) % 4;
    const ms = ss - (size.os ?? 0);
    const os = size.os ?? 0;
    const hard = decodeUtf8(input.slice(0, size.hs));
    const soft0 = decodeBase64Int(decodeUtf8(input.slice(size.hs, cs)));
    const soft1 = decodeBase64Int(decodeUtf8(input.slice(size.hs + ms, size.hs + ms + os)));
    const fs = size.fs !== undefined && size.fs > 0 ? size.fs : cs + soft0 * 4;

    if (input.length < fs) {
      return { frame: null, n: 0 };
    }

    const padding = "A".repeat(ps);
    const text = decodeUtf8(input.slice(0, fs));
    const rawtext = padding + text.slice(cs, fs);

    const raw = decodeBase64Url(rawtext).slice(ps + ls);
    return { frame: { code: hard, count: soft0, index: soft0, ondex: soft1, raw, text }, n: fs };
  }
}
