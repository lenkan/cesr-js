import { encodeBase64Int, encodeBase64Url } from "./encoding-base64.ts";
import { decodeBase64Int, decodeBase64Url } from "./encoding-base64.ts";
import { IndexCode, IndexTable } from "./codes.ts";
import { MatterCode, MatterTable } from "./codes.ts";
import { CountCode_10, CountCode_20, CountTable_10, CountTable_20 } from "./codes.ts";
import type { DataObject } from "./data-type.ts";
import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";

export interface CounterInit {
  code: string;
  count: number;
}

export interface Counter extends CounterInit {
  text: string;
}

export interface GenusInit {
  major: number;
  minor?: number;
}

export interface Genus extends GenusInit {
  minor: number;
}

export interface IndexerInit {
  code: string;
  raw?: Uint8Array;
  index?: number;
  ondex?: number;
}

export interface Indexer extends IndexerInit {
  text: string;
}

export interface MatterInit {
  code: string;
  raw: Uint8Array;
}

export interface Matter extends MatterInit {
  text: string;
}

export interface MessageVersionInit {
  protocol?: string;
  major?: number;
  minor?: number;
  size?: number;

  /**
   * The serialization kind
   */
  kind?: string;

  /**
   * Use the legacy version string format
   */
  legacy?: boolean;
}

export type MessageVersion = Required<MessageVersionInit>;

export type MatterDigest = "blake3_256" | "blake3_512";
export type MatterSignature = "ed25519" | "secp256k1";

export interface FrameData {
  code: string;
  raw?: Uint8Array;
  count?: number;
  index?: number;
  ondex?: number;
  text?: string;
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

/**
 * The result of decoding a stream. The frame property will
 * be null if there is not enough data to decode a frame.
 *
 * The n property indicates the number of bytes consumed
 */
export interface DecodeStreamResult {
  /**
   * The decoded frame. This will be null if there is not enough data in the input
   */
  frame: Required<FrameData> | null;
  /**
   * The number of bytes consumed from the input
   */
  n: number;
}

// VERSION = "PPPPVVVKKKKBBBB.";
// LEGACY_VERSION = "PPPPvvKKKKllllll_";
const REGEX_VERSION_STRING_PROTOCOL = /^[A-Z]{4}$/;
const REGEX_VERSION_STRING_KIND = /^[A-Z]{4}$/;
const REGEX_VERSION_JSON = /^\{"v":"(.*?)".*$/;

function padNumber(num: number, length: number) {
  return num.toString().padStart(length, "0");
}

function prepadBytes(raw: Uint8Array, length: number): Uint8Array {
  if (raw.byteLength === length) {
    return raw;
  }

  const padded = new Uint8Array(length + raw.byteLength);
  padded.set(raw, length);
  return padded;
}

function encodeHexInt(value: number, length: number) {
  if (value >= 16 ** length) {
    throw new Error(`value ${value} too big for hex length ${length}`);
  }

  return value.toString(16).padStart(length, "0");
}

function findHardSize(input: Uint8Array, table: CodeTable): number {
  const start = input[0] === 45 ? decodeUtf8(input.slice(0, 2)) : decodeUtf8(input.slice(0, 1));
  const hs = table.hards[start];

  if (hs === undefined) {
    throw new Error(`Invalid first character in input (${start})`);
  }

  return hs;
}

export function encode(frame: FrameData, table: CodeTable): string {
  const size = table.sizes[frame.code];

  if (!size) {
    throw new Error(`Unable to find code table for ${frame.code}`);
  }

  const ls = size.ls ?? 0;
  const ms = (size.ss ?? 0) - (size.os ?? 0);
  const os = size.os ?? 0;

  const raw = frame.raw ?? new Uint8Array(0);

  const padSize = (3 - ((raw.byteLength + ls) % 3)) % 3;
  const padded = prepadBytes(raw, padSize + ls);

  const soft = ms ? encodeBase64Int(frame.count ?? frame.index ?? padded.byteLength / 3, ms) : "";
  const other = os ? encodeBase64Int(frame.ondex ?? 0, os ?? 0) : "";

  const result = `${frame.code}${soft}${other}${encodeBase64Url(padded).slice(padSize)}`;

  if (size.fs > 0 && result.length < size.fs) {
    throw new Error(`Encoded size ${result.length} does not match expected size ${size.fs}`);
  }

  return result;
}

export function encodeIndexedSignature(alg: MatterSignature, raw: Uint8Array, index: number): string {
  switch (alg) {
    case "ed25519":
      return encodeIndexer({ code: IndexCode.Ed25519_Sig, raw, index });
    default:
      throw new Error(`Unsupported signature algorithm: ${alg}`);
  }
}

export function encodeMatter(raw: MatterInit): string {
  return encode(raw, MatterTable);
}

export function encodeDate(date: Date): string {
  if (date.toString() === "Invalid Date") {
    throw new Error("Invalid date");
  }

  // TODO: Better design for date encoding
  const YYYY = date.getFullYear();
  const MM = padNumber(date.getUTCMonth() + 1, 2);
  const dd = padNumber(date.getUTCDate(), 2);
  const hh = padNumber(date.getUTCHours(), 2);
  const mm = padNumber(date.getUTCMinutes(), 2);
  const ss = padNumber(date.getUTCSeconds(), 2);
  const ms = padNumber(date.getUTCMilliseconds(), 3);

  const raw = decodeBase64Url(`${YYYY}-${MM}-${dd}T${hh}c${mm}c${ss}d${ms}000p00c00`);
  return encodeMatter({ code: MatterCode.DateTime, raw });
}

export function encodeString(txt: string): string {
  const raw = encodeUtf8(txt);
  const length = raw.byteLength;
  const leadSize = length % 3;

  switch (leadSize) {
    case 0:
      return encodeMatter({ code: MatterCode.StrB64_L0, raw });
    case 1:
      return encodeMatter({ code: MatterCode.StrB64_L1, raw });
    case 2:
      return encodeMatter({ code: MatterCode.StrB64_L2, raw });
    default:
      throw new Error(`Could not determine lead size`);
  }
}

export function encodeSignature(alg: MatterSignature, data: Uint8Array): string {
  switch (alg) {
    case "ed25519":
      return encodeMatter({ code: MatterCode.Ed25519_Sig, raw: data });
    case "secp256k1":
      return encodeMatter({ code: MatterCode.ECDSA_256k1_Sig, raw: data });
    default:
      throw new Error(`Unsupported signature algorithm: ${alg}`);
  }
}
export function encodeDigest(alg: MatterDigest, data: Uint8Array): string {
  switch (alg) {
    case "blake3_256":
      return encodeMatter({ code: MatterCode.Blake3_256, raw: data });
    case "blake3_512":
      return encodeMatter({ code: MatterCode.Blake3_512, raw: data });
    default:
      throw new Error(`Unsupported digest algorithm: ${alg}`);
  }
}

export function encodeGenus(genus: GenusInit): string {
  if (typeof genus.major !== "number" || genus.major < 0 || genus.major > 63) {
    throw new Error(`Invalid major version: ${genus.major}`);
  }

  const minor = genus.minor ?? 0;
  if (typeof minor !== "number" || minor < 0) {
    throw new Error(`Invalid minor version: ${minor}`);
  }

  const qb64 = `${CountCode_10.KERIACDCGenusVersion}${encodeBase64Int(genus.major, 1)}${encodeBase64Int(minor, 2)}`;
  return qb64;
}

export function encodeCounterV1(raw: CounterInit): string {
  return encode(raw, CountTable_10);
}

export function encodeCounterV2(raw: CounterInit): string {
  return encode(raw, CountTable_20);
}

export function encodeAttachmentsV1(count: number) {
  if (count > 64 ** 2) {
    return encodeCounterV1({ code: CountCode_10.BigAttachmentGroup, count });
  }

  return encodeCounterV1({ code: CountCode_10.AttachmentGroup, count });
}

export function encodeAttachmentsV2(count: number) {
  if (count > 64 ** 2) {
    return encodeCounterV2({ code: CountCode_20.BigAttachmentGroup, count });
  }

  return encodeCounterV2({ code: CountCode_20.AttachmentGroup, count });
}

export function encodeIndexer(frame: IndexerInit): string {
  return encode(frame, IndexTable);
}

export function encodeVersionString(init: MessageVersionInit) {
  const protocol = init.protocol ?? "KERI";
  const major = init.major ?? 1;
  const minor = init.minor ?? 0;
  const format = init.kind ?? "JSON";

  if (format !== "JSON") {
    throw new Error("Only JSON format is supported for now");
  }

  if (!REGEX_VERSION_STRING_PROTOCOL.test(protocol)) {
    throw new Error("Protocol must be 4 characters");
  }

  if (!REGEX_VERSION_STRING_KIND.test(format)) {
    throw new Error("Format must be 4 characters");
  }

  if (init.legacy) {
    const version = `${encodeHexInt(major, 1)}${encodeHexInt(minor, 1)}`;
    const size = encodeHexInt(init.size ?? 0, 6);
    return `${protocol}${version}${format}${size}_`;
  }

  const version = `${encodeBase64Int(major, 1)}${encodeBase64Int(minor, 2)}`;
  const size = encodeBase64Int(init.size ?? 0, 4);
  return `${protocol}${version}${format}${size}.`;
}

export function encodeMessage<T extends DataObject>(body: T, init: MessageVersionInit = {}): string {
  const str = encodeUtf8(
    JSON.stringify({
      v: encodeVersionString(init),
      ...body,
    }),
  );

  return JSON.stringify({
    v: encodeVersionString({ ...init, size: str.byteLength }),
    ...body,
  });
}

export function decode(input: Uint8Array | string, table: CodeTable): Required<FrameData> {
  const result = decodeStream(input, table);

  if (result.frame === null) {
    throw new Error("Not enough data in input");
  }

  return result.frame;
}

export function decodeStream(input: Uint8Array | string, table: CodeTable): DecodeStreamResult {
  if (typeof input === "string") {
    input = encodeUtf8(input);
  }

  if (input.length < 0) {
    return { frame: null, n: 0 };
  }

  const hs = findHardSize(input, table);

  if (input.length < hs) {
    return { frame: null, n: 0 };
  }

  const hard = decodeUtf8(input.slice(0, hs));
  const size = table.sizes[hard];

  if (!size) {
    throw new Error(`Unknown code ${hard}`);
  }

  const cs = size.hs + size.ss;
  if (input.length < cs) {
    return { frame: null, n: 0 };
  }

  const soft = decodeBase64Int(decodeUtf8(input.slice(size.hs, cs)));
  const fs = size.fs > 0 ? size.fs : cs + soft * 4;

  if (input.length < fs) {
    return { frame: null, n: 0 };
  }

  const ls = size.ls ?? 0;
  const ps = (size.hs + size.ss) % 4;
  const ms = size.ss - (size.os ?? 0);
  const os = size.os ?? 0;
  const soft0 = decodeBase64Int(decodeUtf8(input.slice(size.hs, size.hs + ms)));
  const soft1 = decodeBase64Int(decodeUtf8(input.slice(size.hs + ms, size.hs + ms + os)));

  const padding = "A".repeat(ps);
  const text = decodeUtf8(input.slice(0, fs));
  const rawtext = padding + text.slice(cs, fs);

  const raw = decodeBase64Url(rawtext).slice(ps + ls);
  return { frame: { code: hard, count: soft0, index: soft0, ondex: soft1, raw, text }, n: fs };
}

export function decodeIndexer(input: Uint8Array | string): Indexer {
  return decode(input, IndexTable);
}

export function decodeGenus(input: string): Genus {
  const major = decodeBase64Int(input.slice(5, 6));
  const minor = decodeBase64Int(input.slice(6, 8));
  return { major, minor };
}

export function decodeMatter(input: Uint8Array | string): Matter {
  return decode(input, MatterTable);
}

export function decodeCounterV1(qb64: string | Uint8Array): Counter {
  return decode(qb64, CountTable_10);
}

export function decodeCounterV2(qb64: string | Uint8Array): Counter {
  return decode(qb64, CountTable_20);
}

export function decodeVersionString(data: string | Uint8Array): Required<MessageVersionInit> {
  if (typeof data !== "string") {
    data = decodeUtf8(data.slice(0, 24));
  }

  const match = data.match(REGEX_VERSION_JSON);
  if (!match) {
    throw new Error(`Unable to extract "v" field from ${data}`);
  }

  const value = match[1];

  if (value.endsWith(".") && value.length === 16) {
    const protocol = value.slice(0, 4);
    const major = decodeBase64Int(value.slice(4, 5));
    const minor = decodeBase64Int(value.slice(5, 7));
    const kind = value.slice(7, 11);
    const size = decodeBase64Int(value.slice(12, 15));

    return {
      protocol,
      major,
      minor,
      legacy: false,
      kind,
      size,
    };
  }

  if (value.endsWith("_") && value.length === 17) {
    const protocol = value.slice(0, 4);
    const major = parseInt(value.slice(4, 5), 16);
    const minor = parseInt(value.slice(5, 6), 16);
    const format = value.slice(6, 10);
    const size = parseInt(value.slice(10, 16), 16);

    return {
      protocol,
      major,
      minor,
      kind: format,
      size,
      legacy: true,
    };
  }

  throw new Error(`Invalid version string ${value}`);
}

export const encoding = {
  encode,
  encodeIndexedSignature,
  encodeMatter,
  encodeDate,
  encodeString,
  encodeSignature,
  encodeDigest,
  encodeGenus,
  encodeCounterV1,
  encodeCounterV2,
  encodeAttachmentsV1,
  encodeAttachmentsV2,
  encodeIndexer,
  encodeVersionString,
  encodeMessage,
  decode,
  decodeStream,
  decodeIndexer,
  decodeGenus,
  decodeMatter,
  decodeCounterV1,
  decodeCounterV2,
  decodeVersionString,
};
