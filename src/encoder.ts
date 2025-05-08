import { encodeBase64Int, encodeBase64Url } from "./base64.ts";
import type { CodeSize } from "./decoder.ts";
import type { FrameData } from "./frame.ts";

function prepadBytes(raw: Uint8Array, length: number): Uint8Array {
  if (raw.byteLength === length) {
    return raw;
  }

  const padded = new Uint8Array(length + raw.byteLength);
  padded.set(raw, length);
  return padded;
}

export function encode(frame: FrameData, size: CodeSize): string {
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
