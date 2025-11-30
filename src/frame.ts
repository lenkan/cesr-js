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

export interface FrameSize {
  hs: number;
  fs: number;
  ss: number;
  ls?: number;
  xs?: number;
}

export interface FrameInit {
  code: string;
  size: FrameSize;
  raw?: Uint8Array;
  soft?: number;
}

export interface Frame extends FrameInit {
  readonly quadlets: number;
  text(): string;
  binary(): Uint8Array;
}

/**
 * Resolves the quadlet/triplet count of a frame
 */
export function resolveQuadletCount(frame: FrameInit): number {
  if (typeof frame.size.fs !== "undefined" && frame.size.fs > 0) {
    return frame.size.fs / 4;
  }

  const raw = frame.raw ?? new Uint8Array(0);
  const ls = frame.size.ls ?? 0;
  const ss = frame.size.ss ?? 0;
  const ps = (3 - ((raw.byteLength + ls) % 3)) % 3;
  const fs = raw.byteLength + ps + ls;
  const cs = frame.size.hs + ss;
  return cs / 4 + fs / 3;
}

export function encodeText(frame: FrameInit): string {
  if (frame.code.length !== frame.size.hs) {
    throw new Error(
      `Frame code ${frame.code} length ${frame.code.length} does not match expected size ${frame.size.hs}`,
    );
  }

  const ls = frame.size.ls ?? 0;

  const raw = frame.raw ?? new Uint8Array(0);

  const padSize = (3 - ((raw.byteLength + ls) % 3)) % 3;
  const padded = prepad(raw, padSize + ls);

  const soft = frame.size.ss ? encodeBase64Int(frame.soft ?? padded.byteLength / 3, frame.size.ss) : "";

  const result = `${frame.code}${soft}${encodeBase64Url(padded).slice(padSize)}`;

  if (frame.size.fs !== undefined && frame.size.fs > 0 && result.length < frame.size.fs) {
    throw new Error(`Encoded size ${result.length} does not match expected size ${frame.size.fs}`);
  }

  return result;
}

export function encodeBinary(frame: FrameInit): Uint8Array {
  const raw = frame.raw ?? new Uint8Array(0);

  // TODO: xs
  const ss = frame.size.ss ?? 0;
  const cs = frame.size.hs + ss;
  const ls = frame.size.ls ?? 0;
  const n = Math.ceil((cs * 3) / 4);
  const soft = ss ? encodeBase64Int(frame.soft ?? (ls + raw.length) / 3, ss) : "";
  const padding = 2 * (cs % 4);

  const bcode = toArray(lshift(decodeBase64Int(frame.code + soft), padding), n);
  const result = new Uint8Array(bcode.length + ls + raw.length);
  result.set(bcode, 0);
  result.set(raw, bcode.length + ls);

  return result;
}

export function peekText(input: Uint8Array | string, entry: FrameSize): ReadResult<FrameInit> {
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

  return {
    frame: {
      code: hard,
      soft: soft0,
      raw,
      size: {
        hs: entry.hs,
        fs,
        ss,
        ls,
        xs: entry.xs ?? 0,
      },
    },
    n: fs,
  };
}

export function decodeText(input: string | Uint8Array, entry: FrameSize): FrameInit {
  const result = peekText(input, entry);

  if (!result.frame) {
    throw new Error("Could not parse frame from input");
  }

  return result.frame;
}
