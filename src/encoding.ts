import { encodeBase64Int } from "./encoding-base64.ts";
import { decodeBase64Int, decodeBase64Url } from "./encoding-base64.ts";
import { IndexCode, IndexTable } from "./codes.ts";
import { MatterCode, MatterTable } from "./codes.ts";
import { CountCode_10, CountCode_20 } from "./codes.ts";
import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";
import { CodeTable } from "./code-table.ts";

const encoder = new CodeTable(MatterTable);
const indexer = new CodeTable(IndexTable);

export interface CounterInit {
  code: string;
  count: number;
}

export interface Counter extends CounterInit {
  text: string;
}

export interface GenusInit {
  genus: string;
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

// VERSION = "PPPPVVVKKKKBBBB.";
// LEGACY_VERSION = "PPPPvvKKKKllllll_";
const REGEX_VERSION_STRING_PROTOCOL = /^[A-Z]{4}$/;
const REGEX_VERSION_STRING_KIND = /^[A-Z]{4}$/;
const REGEX_VERSION_JSON = /^\{"v":"(.*?)".*$/;
const REGEX_BASE64_CHARACTER = /^[A-Za-z0-9\-_]+$/;

function padNumber(num: number, length: number) {
  return num.toString().padStart(length, "0");
}

function encodeHexInt(value: number, length: number) {
  if (value >= 16 ** length) {
    throw new Error(`value ${value} too big for hex length ${length}`);
  }

  return value.toString(16).padStart(length, "0");
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
  return decodeUtf8(encoder.encode(raw, "text"));
}

export function encodeMap(data: Record<string, unknown>): string {
  const frames: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    frames.push(encodeTag(key));

    switch (typeof value) {
      case "string":
        frames.push(encodeString(value));
        break;
      case "number":
        frames.push(encodeNumber(value));
        break;
      case "object": {
        if (!Array.isArray(value) && value !== null && !(value instanceof Date)) {
          frames.push(encodeMap({ ...value }));
        } else {
          throw new Error(`Unsupported object type for key ${key}: ${JSON.stringify(value)}`);
        }
        break;
      }
      case "boolean":
        frames.push(
          encodeMatter({
            code: value ? MatterCode.Yes : MatterCode.No,
            raw: new Uint8Array(0),
          }),
        );
        break;
      default:
        throw new Error(`Unsupported value type ${typeof value} for key ${key}`);
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
  if (REGEX_BASE64_CHARACTER.test(txt) && !txt.startsWith("A")) {
    const textsize = txt.length % 4;
    const padsize = (4 - textsize) % 4;
    const leadsize = (3 - textsize) % 3;
    const raw = decodeBase64Url("A".repeat(padsize) + txt).slice(leadsize);

    switch (leadsize) {
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

  const raw = encodeUtf8(txt);
  const length = raw.byteLength;
  const leadSize = length % 3;

  switch (leadSize) {
    case 0:
      return encodeMatter({ code: MatterCode.Bytes_L0, raw });
    case 1:
      return encodeMatter({ code: MatterCode.Bytes_L1, raw });
    case 2:
      return encodeMatter({ code: MatterCode.Bytes_L2, raw });
    default:
      throw new Error(`Could not determine lead size`);
  }
}

export function encodeInt(value: number): string {
  return `${MatterCode.Short}${encodeBase64Int(value, 4)}`;
}

export function encodeNumber(value: number): string {
  const txt = value.toString().replace(".", "p");
  const textsize = txt.length % 4;
  const padsize = (4 - textsize) % 4;
  const leadsize = (3 - textsize) % 3;
  const raw = decodeBase64Url("A".repeat(padsize) + txt).slice(leadsize);

  switch (leadsize) {
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
  return decodeUtf8(encoder.encode(raw, "text"));
}

export function encodeAttachmentsV1(count: number): string {
  if (count > 64 ** 2) {
    return encodeCounter({ code: CountCode_10.BigAttachmentGroup, count });
  }

  return encodeCounter({ code: CountCode_10.AttachmentGroup, count });
}

export function encodeAttachmentsV2(count: number): string {
  if (count > 64 ** 2) {
    return encodeCounter({ code: CountCode_20.BigAttachmentGroup, count });
  }

  return encodeCounter({ code: CountCode_20.AttachmentGroup, count });
}

export function encodeIndexer(frame: IndexerInit): string {
  return decodeUtf8(indexer.encode(frame, "text"));
}

export function encodeVersionString(init: MessageVersionInit): string {
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

export function encodeMessage<T extends Record<string, unknown>>(body: T, init: MessageVersionInit = {}): string {
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

export function decodeGenus(input: string): Genus {
  const genus = input.slice(2, 5);
  const major = decodeBase64Int(input.slice(5, 6));
  const minor = decodeBase64Int(input.slice(6, 8));
  return { genus, major, minor };
}

export function decodeMatter(input: string | Uint8Array): Matter {
  return encoder.decode(input);
}

export function decodeCounter(input: string | Uint8Array): Counter {
  return encoder.decode(input);
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
  decodeGenus,
  decodeMatter,
  decodeCounter,
  decodeVersionString,
};
