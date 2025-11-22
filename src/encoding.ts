import { encodeBase64Int, encodeBase64Url } from "./encoding-base64.ts";
import { decodeBase64Int, decodeBase64Url } from "./encoding-base64.ts";
import { IndexTableInit, MatterTableInit, MatterCode, CountCode_10, CountCode_20 } from "./codes.ts";
import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";
import { type CodeTableEntry, CodeTable, lookupCounterSize } from "./code-table.ts";
import { concat, prepad, toArray } from "./array-utils.ts";
import { lshift } from "./shifting.ts";

export const MatterTable = new CodeTable(MatterTableInit);
export const IndexTable = new CodeTable(IndexTableInit);

export interface FrameData {
  code: string;
  raw?: Uint8Array;
  count?: number;
  index?: number;
  ondex?: number;
  text?: string;
}

export interface ReadResult<T> {
  /**
   * The frame, or null if there was not enough data in the input
   */
  frame?: Required<T>;

  /**
   * The number of bytes consumed from the input
   */
  n: number;
}

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
  raw: Uint8Array;
}

export interface Matter extends MatterInit {
  code: string;
  text: string;
}

const REGEX_BASE64_CHARACTER = /^[A-Za-z0-9\-_]+$/;

function padNumber(num: number, length: number) {
  return num.toString().padStart(length, "0");
}

export function encodeMatter(raw: MatterInit): string {
  const entry = MatterTable.lookup(raw.code);
  return decodeUtf8(encode(raw, entry));
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

export function decodeDate(input: string | Uint8Array): Date {
  const frame = decodeMatter(input);

  if (frame.code !== MatterCode.DateTime) {
    throw new Error(`Expected DateTime matter code, got ${frame.code}`);
  }

  const datestr = frame.text.slice(frame.code.length).replaceAll("c", ":").replaceAll("d", ".").replaceAll("p", "+");
  const result = new Date(datestr);

  if (result.toString() === "Invalid Date") {
    throw new Error(`Invalid date frame: ${frame.text}`);
  }

  return result;
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
  const leadSize = (3 - (raw.byteLength % 3)) % 3;

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

export function decodeString(input: string | Uint8Array): string {
  const frame = decodeMatter(input);

  const size = MatterTable.lookup(frame.code);
  if (!size) {
    throw new Error(`Unknown matter code: ${frame.code}`);
  }

  switch (frame.code) {
    case MatterCode.StrB64_L0:
    case MatterCode.StrB64_L1:
    case MatterCode.StrB64_L2: {
      const bext = encodeBase64Url(concat(new Uint8Array(size.ls), frame.raw));

      if (size.ls === 0 && bext) {
        if (bext[0] === "A") {
          return bext.slice(1);
        }

        return bext;
      }

      return bext.slice((size.ls + 1) % 4);
    }
    case MatterCode.Bytes_L0:
    case MatterCode.Bytes_L1:
    case MatterCode.Bytes_L2:
      return decodeUtf8(frame.raw);
    default:
      throw new Error(`Expected string matter code, got ${frame.code}`);
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

function resolveCountCode(init: CounterInit): string {
  if (init.code.length !== 2 || !init.code.startsWith("-")) {
    throw new Error(`Invalid count code: ${init.code}, must start with '-' and be 2 characters long`);
  }

  if (init.count < 64 ** 2) {
    return init.code;
  }

  return `-${init.code}`;
}

export function encodeCounter(raw: CounterInit): string {
  const code = resolveCountCode(raw);
  const size = lookupCounterSize(code);
  return decodeUtf8(
    encode(
      {
        code,
        count: raw.count,
      },
      size,
    ),
  );
}

export function encodeIndexer(frame: IndexerInit): string {
  const entry = IndexTable.lookup(frame.code);
  return decodeUtf8(encode(frame, entry));
}

export function decodeGenus(input: string): Genus {
  const genus = input.slice(2, 5);
  const major = decodeBase64Int(input.slice(5, 6));
  const minor = decodeBase64Int(input.slice(6, 8));
  return { genus, major, minor };
}

export function encodeHexNumber(num: string): string {
  return `${MatterCode.Salt_128}${encodeBase64Int(parseInt(num, 16), 22)}`;
}

export function decodeHexNumber(input: string | Uint8Array): string {
  const frame = decodeMatter(input);
  return decodeBase64Int(frame.text.slice(frame.code.length)).toString(16);
}

export function decodeMatter(input: string | Uint8Array): Matter {
  if (typeof input === "string") {
    input = encodeUtf8(input);
  }

  const result = readMatter(input);

  if (!result.frame) {
    throw new Error("Not enough data in input");
  }

  return result.frame;
}

export function readMatter(input: Uint8Array): ReadResult<Matter> {
  if (input.length < 4) {
    return { n: 0 };
  }

  const entry = MatterTable.lookup(input);
  const result = read(input, entry);
  if (!result.frame) {
    return { n: 0 };
  }

  return {
    frame: {
      code: result.frame.code,
      raw: result.frame.raw,
      text: result.frame.text,
    },
    n: result.n,
  };
}

export function readIndexer(input: Uint8Array): ReadResult<Indexer> {
  if (input.length < 4) {
    return { n: 0 };
  }
  const entry = IndexTable.lookup(input);
  const result = read(input, entry);
  if (!result.frame) {
    return { n: 0 };
  }
  return {
    frame: {
      code: result.frame.code,
      raw: result.frame.raw,
      text: result.frame.text,
      index: result.frame.index,
      ondex: result.frame.ondex,
    },
    n: result.n,
  };
}

export function readCounter(input: Uint8Array): ReadResult<Counter> {
  const entry = lookupCounterSize(input);

  if (!entry) {
    return { n: 0 };
  }

  const result = read(input, entry);

  if (!result.frame) {
    return { n: 0 };
  }

  return {
    frame: {
      code: result.frame.code.replace(/^--/, "-"),
      count: result.frame.count,
      text: result.frame.text,
    },
    n: result.n,
  };
}

export function decodeCounter(input: string | Uint8Array): Counter {
  if (typeof input === "string") {
    input = encodeUtf8(input);
  }

  const result = readCounter(input);

  if (!result.frame) {
    throw new Error("Not enough data in input");
  }

  return result.frame;
}

export function decodeIndexer(input: string | Uint8Array): Indexer {
  if (typeof input === "string") {
    input = encodeUtf8(input);
  }

  const result = readIndexer(input);
  if (!result.frame) {
    throw new Error("Not enough data in input");
  }

  return result.frame;
}

function read(input: Uint8Array, entry: CodeTableEntry): { n: number; frame?: Required<FrameData> } {
  const ss = entry.ss ?? 0;
  const cs = entry.hs + ss;
  if (input.length < cs) {
    return { n: 0 };
  }

  const ls = entry.ls ?? 0;
  const ps = (entry.hs + ss) % 4;
  const ms = ss - (entry.os ?? 0);
  const os = entry.os ?? 0;
  const hard = decodeUtf8(input.slice(0, entry.hs));
  const soft0 = decodeBase64Int(decodeUtf8(input.slice(entry.hs, cs)));
  const soft1 = decodeBase64Int(decodeUtf8(input.slice(entry.hs + ms, entry.hs + ms + os)));
  const fs = entry.fs !== undefined && entry.fs > 0 ? entry.fs : cs + soft0 * 4;

  if (input.length < fs - ls) {
    return { n: 0 };
  }

  const padding = "A".repeat(ps);
  const text = decodeUtf8(input.slice(0, fs));
  const rawtext = padding + text.slice(cs);

  const raw = decodeBase64Url(rawtext).slice(ps + ls);

  return { frame: { code: hard, count: soft0, index: soft0, ondex: soft1, raw, text }, n: fs };
}

export function encodeBinary(frame: FrameData, table: CodeTable = MatterTable): Uint8Array {
  const raw = frame.raw ?? new Uint8Array(0);

  // TODO: xs
  const size = table.lookup(frame.code);
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

function encode(frame: FrameData, size: CodeTableEntry): Uint8Array {
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
