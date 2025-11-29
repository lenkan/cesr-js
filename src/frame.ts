import { prepad, toArray } from "./array-utils.ts";
import { decodeBase64Int, decodeBase64Url, encodeBase64Int, encodeBase64Url } from "./encoding-base64.ts";
import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";
import { lshift } from "./shifting.ts";

export interface ReadResult<T> {
  /**
   * The frame, or null if there was not enough data in the input
   */
  frame?: T;

  /**
   * The number of bytes consumed from the input
   */
  n: number;
}

export interface FrameSizeInit {
  hs: number;
  fs?: number;
  ss?: number;
  ls?: number;
  xs?: number;
}

export interface FrameSize {
  hs: number;
  fs: number;
  ss: number;
  ls: number;
  xs: number;
}

export interface FrameInit {
  code: string;
  size: FrameSizeInit;
  raw?: Uint8Array;
  soft?: number;
}

export class Frame {
  readonly code: string;
  readonly soft?: number;
  readonly raw: Uint8Array;
  readonly #size: FrameSize;

  constructor(init: FrameInit) {
    this.code = init.code;
    this.soft = init.soft;
    this.raw = init.raw || new Uint8Array();
    this.#size = {
      hs: init.size.hs,
      fs: init.size.fs ?? 0,
      ss: init.size.ss ?? 0,
      ls: init.size.ls ?? 0,
      xs: init.size.xs ?? 0,
    };
  }

  get size() {
    return this.#size;
  }

  /**
   * Gets the number of quadlets/triplets in this frame
   */
  get n(): number {
    if (this.size.fs > 0) {
      return this.size.fs / 4;
    }

    const ps = (3 - ((this.raw.byteLength + this.size.ls) % 3)) % 3;
    const fs = this.raw.byteLength + ps + this.size.ls;
    const cs = this.size.hs + this.size.ss;
    return cs / 4 + fs / 3;
  }

  text(): string {
    if (this.code.length !== this.size.hs) {
      throw new Error(
        `Frame code ${this.code} length ${this.code.length} does not match expected size ${this.size.hs}`,
      );
    }

    const ls = this.size.ls ?? 0;

    const raw = this.raw ?? new Uint8Array(0);

    const padSize = (3 - ((raw.byteLength + ls) % 3)) % 3;
    const padded = prepad(raw, padSize + ls);

    const soft = this.size.ss ? encodeBase64Int(this.soft ?? padded.byteLength / 3, this.size.ss) : "";

    const result = `${this.code}${soft}${encodeBase64Url(padded).slice(padSize)}`;

    if (this.size.fs !== undefined && this.size.fs > 0 && result.length < this.size.fs) {
      throw new Error(`Encoded size ${result.length} does not match expected size ${this.size.fs}`);
    }

    return result;
  }

  binary(): Uint8Array {
    const raw = this.raw ?? new Uint8Array(0);

    // TODO: xs
    const size = this.size;
    const cs = size.hs + size.ss;
    // const ms = size.ss - size.os;
    // const os = size.os;
    const n = Math.ceil((cs * 3) / 4);
    const soft = size.ss ? encodeBase64Int(this.soft ?? (size.ls + raw.length) / 3, size.ss) : "";
    // const other = os ? encodeBase64Int(this.other ?? 0, os ?? 0) : "";
    const padding = 2 * (cs % 4);

    const bcode = toArray(lshift(decodeBase64Int(this.code + soft), padding), n);
    const result = new Uint8Array(bcode.length + size.ls + raw.length);
    result.set(bcode, 0);
    result.set(raw, bcode.length + size.ls);

    return result;
  }

  static peek(input: string | Uint8Array, entry: FrameSizeInit): ReadResult<Frame> {
    if (typeof input === "string") {
      input = encodeUtf8(input);
    }

    if (input.length < 4) {
      return { n: 0 };
    }

    const ss = entry.ss ?? 0;
    const cs = entry.hs + ss;
    if (input.length < cs) {
      return { n: 0 };
    }

    const ls = entry.ls ?? 0;
    const ps = (entry.hs + ss) % 4;
    const hard = decodeUtf8(input.slice(0, entry.hs));
    const soft0 = decodeBase64Int(decodeUtf8(input.slice(entry.hs, entry.hs + ss)));

    const fs = entry.fs !== undefined && entry.fs > 0 ? entry.fs : cs + soft0 * 4;

    if (input.length < fs - ls) {
      return { n: 0 };
    }

    const padding = "A".repeat(ps);
    const text = decodeUtf8(input.slice(0, fs));
    const rawtext = padding + text.slice(cs);

    const raw = decodeBase64Url(rawtext).slice(ps + ls);

    return { frame: new Frame({ code: hard, soft: soft0, raw, size: entry }), n: fs };
  }

  static parse(input: string | Uint8Array, entry: FrameSizeInit): Frame {
    const result = Frame.peek(input, entry);

    if (!result.frame) {
      throw new Error("Could not parse frame from input");
    }

    return result.frame;
  }
}
