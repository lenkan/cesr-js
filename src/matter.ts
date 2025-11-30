import { concat } from "./array-utils.ts";
import { MatterCode, MatterTableInit } from "./codes.ts";
import { decodeBase64Int, decodeBase64Url, encodeBase64Url } from "./encoding-base64.ts";
import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";
import {
  encodeBinary,
  encodeText,
  decodeText,
  peekText,
  resolveQuadletCount,
  type Frame,
  type FrameSize,
  type ReadResult,
  type FrameInit,
} from "./frame.ts";

const REGEX_BASE64_CHARACTER = /^[A-Za-z0-9\-_]+$/;

const Table: Record<string, FrameSize> = {};
const Hards: Record<string, number> = {};
for (const [key, value] of Object.entries(MatterTableInit)) {
  Table[key] = {
    hs: value.hs,
    fs: value.fs ?? 0,
    ss: value.ss ?? 0,
    ls: value.ls ?? 0,
    xs: value.xs ?? 0,
  };

  Hards[key.slice(0, 1)] = value.hs;
}

/**
 * Finds the size table of a code
 * @param input The input to parse the code from
 */
function lookup(input: string | Uint8Array): FrameSize {
  if (typeof input !== "string") {
    input = decodeUtf8(input.slice(0, 4));
  }

  if (input.length === 0) {
    throw new Error("Received empty input code for lookup");
  }

  const hs = Hards[input.slice(0, 1)];
  const hard = input.slice(0, hs ?? 4);
  const entry = Table[hard];

  if (!entry) {
    throw new Error(`Unknown code ${hard}`);
  }

  return entry;
}

function padNumber(num: number, length: number) {
  return num.toString().padStart(length, "0");
}

function decodeHexRaw(input: Uint8Array): string {
  let value = "";

  for (const byte of input) {
    value = value + byte.toString(16).padStart(2, "0");
  }

  return value.replace(/^0+/, "") || "0";
}

function encodeHexRaw(input: string, entry: FrameSize): Uint8Array {
  const ls = entry.ls ?? 0;
  const size = Math.floor(((entry.fs - entry.hs - entry.ss) * 3) / 4) - ls;

  const raw = new Uint8Array(size);

  let bigint = BigInt("0x" + input);
  for (let i = 0; i < size; i++) {
    raw[size - i - 1] = Number(bigint % 256n);
    bigint = bigint / 256n;
  }

  return raw;
}

/**
 * Constructs a base64url string to padded raw bytes
 * for use in Matter.
 */
function encodeBase64Raw(txt: string) {
  if (!REGEX_BASE64_CHARACTER.test(txt)) {
    throw new Error(`Invalid base64url string: ${txt}`);
  }

  if (txt.startsWith("A")) {
    throw new Error(`Base64url string must not start with padding character 'A': ${txt}`);
  }

  const textsize = txt.length % 4;
  const padsize = (4 - textsize) % 4;
  const leadsize = (3 - textsize) % 3;
  const raw = decodeBase64Url("A".repeat(padsize) + txt);
  return raw.slice(leadsize);
}

/**
 * Resolves the lead character(s) for variable size encoding
 *
 * For example, if one lead byte is required, the lead character will be "5" or "8AA"
 * depending on the size of the raw data
 *
 * @param raw The raw data to encode
 * @returns The lead character(s) for the variable size encoding
 */
function resolveLeadCharacter(raw: Uint8Array): string {
  const leadSize = (3 - (raw.byteLength % 3)) % 3;

  if (raw.length > 64 ** 2) {
    switch (leadSize) {
      case 0:
        return "7AA";
      case 1:
        return "8AA";
      case 2:
        return "9AA";
      default:
        throw new Error(`Could not determine lead size`);
    }
  }

  switch (leadSize) {
    case 0:
      return "4";
    case 1:
      return "5";
    case 2:
      return "6";
    default:
      throw new Error(`Could not determine lead size`);
  }
}

function resolveVariableSizeCode(code: string, raw: Uint8Array): string {
  const type = code.charAt(code.length - 1);
  const lead = resolveLeadCharacter(raw);
  return `${lead}${type}`;
}

function createRaw(code: string): (raw: Uint8Array) => Matter {
  return (raw: Uint8Array): Matter => {
    return new Matter({ code, raw });
  };
}

export interface MatterInit {
  code: string;
  raw: Uint8Array;
  soft?: number;
}

const CryptoMatter = {
  ed25519_seed: createRaw(MatterCode.Ed25519_Seed),
  ed25519: createRaw(MatterCode.Ed25519),
  ed25519N: createRaw(MatterCode.Ed25519N),
  ed25519_sig: createRaw(MatterCode.Ed25519_Sig),
  x25519: createRaw(MatterCode.X25519),
  blake3_256: createRaw(MatterCode.Blake3_256),
  blake2b_256: createRaw(MatterCode.Blake2b_256),
  blake2s_256: createRaw(MatterCode.Blake2s_256),
  sha3_256: createRaw(MatterCode.SHA3_256),
  sha2_256: createRaw(MatterCode.SHA2_256),
  ecdsa_256k1Seed: createRaw(MatterCode.ECDSA_256k1_Seed),
  ed448_seed: createRaw(MatterCode.Ed448_Seed),
  x448: createRaw(MatterCode.X448),
  x25519_private: createRaw(MatterCode.X25519_Private),
  x25519_cipher_Seed: createRaw(MatterCode.X25519_Cipher_Seed),
};

const PrimitiveMatter = {
  from: {
    tag(input: string): Matter {
      switch (input.length) {
        case 1:
          return new Matter({
            code: Matter.Code.Tag1,
            raw: new Uint8Array(0),
            soft: decodeBase64Int(input.padStart(2, "_")),
          });
        case 2:
          return new Matter({
            code: Matter.Code.Tag2,
            raw: new Uint8Array(0),
            soft: decodeBase64Int(input),
          });
        default:
          throw new Error(`Unsupported tag length: ${input.length} for tag "${input}"`);
      }
    },

    decimal(input: number): Matter {
      const raw = encodeBase64Raw(input.toString().replace(".", "p"));
      const code = resolveVariableSizeCode(Matter.Code.Decimal_L0, raw);
      return new Matter({ code, raw });
    },

    hex(input: string): Matter {
      // TODO: Choose smaller/bigger size based on input
      const entry = lookup(Matter.Code.Salt_128);
      const raw = encodeHexRaw(input, entry);
      return new Matter({ code: Matter.Code.Salt_128, raw });
    },
    string(input: string): Matter {
      if (REGEX_BASE64_CHARACTER.test(input) && !input.startsWith("A")) {
        const raw = encodeBase64Raw(input);
        const code = resolveVariableSizeCode(Matter.Code.StrB64_L0, raw);
        return new Matter({ code, raw });
      }

      const raw = encodeUtf8(input);
      const code = resolveVariableSizeCode(Matter.Code.Bytes_L0, raw);
      return new Matter({ code, raw });
    },

    date(date: Date): Matter {
      if (date.toString() === "Invalid Date") {
        throw new Error("Invalid date");
      }

      const YYYY = date.getFullYear();
      const MM = padNumber(date.getUTCMonth() + 1, 2);
      const dd = padNumber(date.getUTCDate(), 2);
      const hh = padNumber(date.getUTCHours(), 2);
      const mm = padNumber(date.getUTCMinutes(), 2);
      const ss = padNumber(date.getUTCSeconds(), 2);
      const ms = padNumber(date.getUTCMilliseconds(), 3);

      const raw = decodeBase64Url(`${YYYY}-${MM}-${dd}T${hh}c${mm}c${ss}d${ms}000p00c00`);
      return new Matter({ code: Matter.Code.DateTime, raw });
    },
  },

  as: {
    string(frame: FrameInit): string {
      const raw = frame.raw || new Uint8Array();
      switch (frame.code) {
        case Matter.Code.StrB64_L0:
        case Matter.Code.StrB64_L1:
        case Matter.Code.StrB64_L2:
        case Matter.Code.StrB64_Big_L0:
        case Matter.Code.StrB64_Big_L1:
        case Matter.Code.StrB64_Big_L2: {
          const ls = frame.size.ls ?? 0;
          const bext = encodeBase64Url(concat(new Uint8Array(ls), raw));

          if (ls === 0 && bext) {
            if (bext[0] === "A") {
              return bext.slice(1);
            }

            return bext;
          }

          return bext.slice((ls + 1) % 4);
        }
        case Matter.Code.Bytes_L0:
        case Matter.Code.Bytes_L1:
        case Matter.Code.Bytes_L2:
        case Matter.Code.Bytes_Big_L0:
        case Matter.Code.Bytes_Big_L1:
        case Matter.Code.Bytes_Big_L2:
          return decodeUtf8(raw);
        default:
          throw new Error(`Cannot decode ${frame.code} as a string`);
      }
    },

    date(init: FrameInit): Date {
      const raw = init.raw || new Uint8Array();
      if (init.code !== Matter.Code.DateTime) {
        throw new Error(`Cannot decode ${init.code} as a Date`);
      }

      const text = encodeBase64Url(raw);
      const datestr = text.replaceAll("c", ":").replaceAll("d", ".").replaceAll("p", "+");
      const result = new Date(datestr);

      if (result.toString() === "Invalid Date") {
        throw new Error(`Invalid date frame: ${text}`);
      }

      return result;
    },

    hex(frame: FrameInit): string {
      const raw = frame.raw || new Uint8Array();
      return decodeHexRaw(raw);
    },
  },
};

export class Matter implements Frame, MatterInit {
  readonly code: string;
  readonly soft?: number;
  readonly raw: Uint8Array;

  constructor(init: MatterInit) {
    this.code = init.code;
    this.raw = init.raw;
    this.soft = init.soft;
  }

  get quadlets(): number {
    return resolveQuadletCount(this);
  }

  get size() {
    return lookup(this.code);
  }

  text(): string {
    return encodeText(this);
  }

  binary(): Uint8Array {
    return encodeBinary(this);
  }

  static readonly Code = MatterCode;

  static from(code: string, raw: Uint8Array): Matter {
    return new Matter({ code, raw });
  }

  static peek(input: Uint8Array): ReadResult<Matter> {
    const entry = lookup(input);
    const result = peekText(input, entry);

    if (!result.frame) {
      return { n: result.n };
    }

    return {
      frame: new Matter({
        code: result.frame.code,
        raw: result.frame.raw ?? new Uint8Array(0),
        soft: result.frame.soft,
      }),
      n: result.n,
    };
  }

  static parse(input: string | Uint8Array): Matter {
    const entry = lookup(input);
    const frame = decodeText(input, entry);
    return new Matter({
      code: frame.code,
      raw: frame.raw ?? new Uint8Array(0),
      soft: frame.soft,
    });
  }

  /**
   * Convert to Matter primitive types
   */
  get as() {
    return {
      string: () => PrimitiveMatter.as.string(this),
      date: () => PrimitiveMatter.as.date(this),
      hex: () => PrimitiveMatter.as.hex(this),
    };
  }

  /**
   * Predefined Matter creators for common crypto types
   */
  static readonly crypto = CryptoMatter;

  /**
   * Predefined Matter creators for common value types
   */
  static readonly primitive = PrimitiveMatter.from;
}
