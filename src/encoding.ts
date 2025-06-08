import { encodeBase64Int, encodeBase64Url } from "./encoding-base64.ts";
import { decodeBase64Int, decodeBase64Url } from "./encoding-base64.ts";
import { IndexCode, IndexTable } from "./codes.ts";
import { MatterCode, MatterTable } from "./codes.ts";
import { CountCode_10, CountCode_20 } from "./codes.ts";
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
  soft?: string;
  raw: Uint8Array;
}

export interface Matter extends MatterInit {
  code: string;
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

export interface ParsingContext {
  code: string;
  version?: number;
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

interface EncodingScheme {
  selector: string;
  type?: string;
  size: number;
}

// VERSION = "PPPPVVVKKKKBBBB.";
// LEGACY_VERSION = "PPPPvvKKKKllllll_";
const REGEX_VERSION_STRING_PROTOCOL = /^[A-Z]{4}$/;
const REGEX_VERSION_STRING_KIND = /^[A-Z]{4}$/;
const REGEX_VERSION_JSON = /^\{"v":"(.*?)".*$/;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const INDEXER_ENCODING_SCHEME: EncodingScheme[] = [
  { selector: ALPHABET, size: 1 },
  { selector: "01234", size: 2 },
];

// TODO: Create a lookup table for encoding schemes to avoid looping through
const ENCODING_SCHEME: EncodingScheme[] = [
  { selector: ALPHABET, size: 1 },
  { selector: "0456", size: 2 },
  { selector: "123789", size: 4 },
  { selector: "-", type: ALPHABET, size: 2 },
  { selector: "-", type: "-", size: 3 },
  { selector: "-", type: "_", size: 5 },
];

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

function isIndexer(context?: ParsingContext): boolean {
  if (!context || !context.code.startsWith("-")) {
    return false;
  }

  if (context.version === 1) {
    switch (context.code) {
      case CountCode_10.ControllerIdxSigs:
      case CountCode_10.TransIdxSigGroups:
      case CountCode_10.TransLastIdxSigGroups:
      case CountCode_10.WitnessIdxSigs:
        return true;
      default:
        return false;
    }
  }

  switch (context.code) {
    case CountCode_20.WitnessIdxSigs:
    case CountCode_20.BigWitnessIdxSigs:
    case CountCode_20.TransIdxSigGroups:
    case CountCode_20.BigTransIdxSigGroups:
    case CountCode_20.TransLastIdxSigGroups:
    case CountCode_20.BigTransLastIdxSigGroups:
    case CountCode_20.BigControllerIdxSigs:
    case CountCode_20.ControllerIdxSigs:
      return true;
    default:
      return false;
  }
}

function findHardSize(input: Uint8Array, context?: ParsingContext): number {
  const selector = decodeUtf8(input.slice(0, 1));
  const type = decodeUtf8(input.slice(1, 2));

  if (isIndexer(context)) {
    for (const scheme of INDEXER_ENCODING_SCHEME) {
      if (scheme.selector.includes(selector)) {
        return scheme.size;
      }
    }

    throw new Error(`Invalid first character in input ${selector}`);
  }

  for (const scheme of ENCODING_SCHEME) {
    if (scheme.selector.includes(selector)) {
      if (!scheme.type || scheme.type.includes(type)) {
        return scheme.size;
      }
    }
  }

  throw new Error(`Invalid first character in input ${selector}`);
}

function findCodeSize(hard: string, context?: ParsingContext): CodeSize {
  let size: CodeSize | null = null;

  if (isIndexer(context)) {
    size = IndexTable[hard];
  } else if (hard.startsWith("-")) {
    // Counter, no need to lookup since they are all determined by selector
    const selector = hard.charAt(1);

    if (ALPHABET.includes(selector)) {
      size = { hs: 2, ss: 2, fs: 4 };
    } else if (selector === "-") {
      size = { hs: 3, ss: 5, fs: 8 };
    } else if (selector === "_") {
      size = { hs: 5, ss: 3, fs: 8 };
    }
  } else {
    size = MatterTable[hard];
  }

  if (!size) {
    throw new Error(`Unknown code ${hard}`);
  }

  return size;
}

export function encode(frame: FrameData, size: CodeSize): string {
  if (frame.code.length !== size.hs) {
    throw new Error(`Frame code ${frame.code} length ${frame.code.length} does not match expected size ${size.hs}`);
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
  const size = MatterTable[raw.code];

  if (!size) {
    throw new Error(`Unknown matter code ${raw.code}`);
  }

  return encode(raw, size);
}

export function encodeMap(data: DataObject): string {
  const frames: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    frames.push(encodeTag(key));
    if (typeof value === "number") {
      frames.push(encodeNumber(value));
    }
  }

  const result = frames.join("");
  const header = encodeCounter({ code: CountCode_20.GenericMapGroup, count: Math.floor(result.length / 4) });

  return `${header}${frames.join("")}`;
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

export function encodeTag(tag: string): string {
  switch (tag.length) {
    case 1:
      return `${MatterCode.Tag1}${tag.padStart(2, "_")}`;
    case 2:
      return `${MatterCode.Tag2}${tag}`;
    default:
      throw new Error(`Could not determine tag size`);
  }
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

export function encodeInt(value: number): string {
  return `${MatterCode.Short}${encodeBase64Int(value, 4)}`;
}

export function encodeNumber(value: number): string {
  const result = value.toString().replace(".", "p");
  const ts = result.length % 4;
  const ps = (4 - ts) % 4;
  const ls = (3 - ts) % 3;
  const raw = decodeBase64Url("A".repeat(ps) + result).slice(ls);

  switch (ls) {
    case 0:
      return encodeMatter({ code: MatterCode.Decimal_L0, raw });
    case 1:
      return encodeMatter({ code: MatterCode.Decimal_L1, raw });
    case 2:
      return encodeMatter({ code: MatterCode.Decimal_L2, raw });
    default:
      throw new Error(`Could not determine lead size for decimal ${value}`);
  }
}

export function encodeSignature(alg: MatterSignature, raw: Uint8Array): string {
  switch (alg) {
    case "ed25519":
      return encodeMatter({ code: MatterCode.Ed25519_Sig, raw });
    case "secp256k1":
      return encodeMatter({ code: MatterCode.ECDSA_256k1_Sig, raw });
    default:
      throw new Error(`Unsupported signature algorithm: ${alg}`);
  }
}

export function encodeDigest(alg: MatterDigest, raw: Uint8Array): string {
  switch (alg) {
    case "blake3_256":
      return encodeMatter({ code: MatterCode.Blake3_256, raw });
    case "blake3_512":
      return encodeMatter({ code: MatterCode.Blake3_512, raw });
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

export function encodeCounter(raw: CounterInit): string {
  return encode(raw, findCodeSize(raw.code));
}

export function encodeAttachmentsV1(count: number) {
  if (count > 64 ** 2) {
    return encodeCounter({ code: CountCode_10.BigAttachmentGroup, count });
  }

  return encodeCounter({ code: CountCode_10.AttachmentGroup, count });
}

export function encodeAttachmentsV2(count: number) {
  if (count > 64 ** 2) {
    return encodeCounter({ code: CountCode_20.BigAttachmentGroup, count });
  }

  return encodeCounter({ code: CountCode_20.AttachmentGroup, count });
}

export function encodeIndexer(frame: IndexerInit): string {
  const size = IndexTable[frame.code];

  if (!size) {
    throw new Error(`Unknown indexer code ${frame.code}`);
  }

  return encode(frame, size);
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

export function decode(input: string | Uint8Array, context?: ParsingContext): Required<FrameData> {
  const result = decodeStream(input, context);

  if (result.frame === null) {
    throw new Error("Not enough data in input");
  }

  return result.frame;
}

export function decodeStream(input: string | Uint8Array, context?: ParsingContext): DecodeStreamResult {
  if (typeof input === "string") {
    input = encodeUtf8(input);
  }

  if (input.length < 1) {
    return { frame: null, n: 0 };
  }

  const hs = findHardSize(input, context);

  if (input.length < hs) {
    return { frame: null, n: 0 };
  }

  const hard = decodeUtf8(input.slice(0, hs));
  const size = findCodeSize(hard, context);

  if (!size) {
    throw new Error(`Unknown code ${hard}`);
  }

  const cs = size.hs + size.ss;
  if (input.length < cs) {
    return { frame: null, n: 0 };
  }

  const ls = size.ls ?? 0;
  const ps = (size.hs + size.ss) % 4;
  const ms = size.ss - (size.os ?? 0);
  const os = size.os ?? 0;
  const soft0 = decodeBase64Int(decodeUtf8(input.slice(size.hs, cs)));
  const soft1 = decodeBase64Int(decodeUtf8(input.slice(size.hs + ms, size.hs + ms + os)));
  const fs = size.fs > 0 ? size.fs : cs + soft0 * 4;

  if (input.length < fs) {
    return { frame: null, n: 0 };
  }

  const padding = "A".repeat(ps);
  const text = decodeUtf8(input.slice(0, fs));
  const rawtext = padding + text.slice(cs, fs);

  const raw = decodeBase64Url(rawtext).slice(ps + ls);
  return { frame: { code: hard, count: soft0, index: soft0, ondex: soft1, raw, text }, n: fs };
}

export function decodeGenus(input: string): Genus {
  const major = decodeBase64Int(input.slice(5, 6));
  const minor = decodeBase64Int(input.slice(6, 8));
  return { major, minor };
}

export function decodeMatter(input: string | Uint8Array): Matter {
  return decode(input);
}

export function decodeCounter(input: string | Uint8Array): Counter {
  return decode(input);
}

export function decodeVersionString(input: string | Uint8Array): Required<MessageVersionInit> {
  if (typeof input !== "string") {
    input = decodeUtf8(input.slice(0, 24));
  }

  const match = input.match(REGEX_VERSION_JSON);
  if (!match) {
    throw new Error(`Unable to extract "v" field from ${input}`);
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
  encodeMap,
  encodeMatter,
  encodeDate,
  encodeString,
  encodeNumber,
  encodeSignature,
  encodeDigest,
  encodeGenus,
  encodeCounter,
  encodeAttachmentsV1,
  encodeAttachmentsV2,
  encodeIndexer,
  encodeVersionString,
  encodeMessage,
  decode,
  decodeStream,
  decodeGenus,
  decodeMatter,
  decodeCounter,
  decodeVersionString,
};
