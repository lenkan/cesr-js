import { concat } from "./array-utils.ts";
import { CodeTable, type CodeTableEntry } from "./code-table.ts";
import { MatterCode, MatterTableInit } from "./codes.ts";
import { decodeBase64Int, decodeBase64Url, encodeBase64Url } from "./encoding-base64.ts";
import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";
import { Frame } from "./frame.ts";

const Table = new CodeTable(MatterTableInit);
const REGEX_BASE64_CHARACTER = /^[A-Za-z0-9\-_]+$/;

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

function encodeHexRaw(input: string, entry: CodeTableEntry): Uint8Array {
  const size = Math.floor(((entry.fs - entry.hs - entry.ss) * 3) / 4) - entry.ls;

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

export interface MatterInit {
  code: string;
  raw: Uint8Array;
  soft?: number;
}

export class Matter extends Frame implements MatterInit {
  size: CodeTableEntry;

  private constructor(init: MatterInit) {
    super({
      code: init.code,
      raw: init.raw,
      soft: init.soft,
      size: Table.lookup(init.code),
    });
    this.size = Table.lookup(this.code);
  }

  static readonly Table = Table;
  static readonly Code = MatterCode;

  private static creator(code: string): (raw: Uint8Array) => Matter {
    return (raw: Uint8Array): Matter => {
      return new Matter({ code, raw });
    };
  }

  static from(init: MatterInit): Matter;
  static from(code: string, raw: Uint8Array): Matter;
  static from(init: string | MatterInit, raw?: Uint8Array): Matter {
    if (typeof init === "string") {
      if (!raw) {
        throw new Error("Raw data must be provided when using code string");
      }

      return new Matter({ code: init, raw });
    }

    return new Matter(init);
  }

  static parse(input: string | Uint8Array): Matter {
    const entry = Table.lookup(input);
    const frame = Frame.parse(input, entry);
    return Matter.from({
      code: frame.code,
      raw: frame.raw,
      soft: frame.soft,
    });
  }

  static create = {
    ed25519_seed: Matter.creator(MatterCode.Ed25519_Seed),
    ed25519: Matter.creator(MatterCode.Ed25519),
    ed25519N: Matter.creator(MatterCode.Ed25519N),
    ed25519_sig: Matter.creator(MatterCode.Ed25519_Sig),
    X25519: Matter.creator(MatterCode.X25519),
    blake3_256: Matter.creator(MatterCode.Blake3_256),
    blake2b_256: Matter.creator(MatterCode.Blake2b_256),
    blake2s_256: Matter.creator(MatterCode.Blake2s_256),
    sha3_256: Matter.creator(MatterCode.SHA3_256),
    sha2_256: Matter.creator(MatterCode.SHA2_256),
    ecdsa_256k1Seed: Matter.creator(MatterCode.ECDSA_256k1_Seed),
    ed448_seed: Matter.creator(MatterCode.Ed448_Seed),
    x448: Matter.creator(MatterCode.X448),
    x25519_private: Matter.creator(MatterCode.X25519_Private),
    x25519_cipher_Seed: Matter.creator(MatterCode.X25519_Cipher_Seed),

    tag(input: string): Matter {
      switch (input.length) {
        case 1:
          return Matter.from({
            code: MatterCode.Tag1,
            raw: new Uint8Array(0),
            soft: decodeBase64Int(input.padStart(2, "_")),
          });
        case 2:
          return Matter.from({
            code: MatterCode.Tag2,
            raw: new Uint8Array(0),
            soft: decodeBase64Int(input),
          });
        default:
          throw new Error(`Unsupported tag length: ${input.length} for tag "${input}"`);
      }
    },

    string(input: string): Matter {
      if (REGEX_BASE64_CHARACTER.test(input) && !input.startsWith("A")) {
        const raw = encodeBase64Raw(input);
        const code = resolveVariableSizeCode(MatterCode.StrB64_L0, raw);
        return new Matter({ code, raw });
      }

      const raw = encodeUtf8(input);
      const code = resolveVariableSizeCode(MatterCode.Bytes_L0, raw);
      return new Matter({ code, raw });
    },

    decimal(input: number): Matter {
      const raw = encodeBase64Raw(input.toString().replace(".", "p"));
      const code = resolveVariableSizeCode(MatterCode.Decimal_L0, raw);
      return new Matter({ code, raw });
    },

    hex(input: string): Matter {
      // TODO: Choose smaller/bigger size based on input
      const entry = Matter.Table.lookup(MatterCode.Salt_128);
      const raw = encodeHexRaw(input, entry);
      return new Matter({ code: MatterCode.Salt_128, raw });
    },

    integer(input: number): Matter {
      const raw = encodeBase64Raw(input.toString());
      return new Matter({ code: MatterCode.Short, raw });
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
      return new Matter({ code: MatterCode.DateTime, raw });
    },
  };

  readonly decode = {
    hex: (): string => {
      return decodeHexRaw(this.raw);
    },
    date: (): Date => {
      if (this.code !== MatterCode.DateTime) {
        throw new Error(`Cannot decode ${this.code} as a Date`);
      }

      const text = encodeBase64Url(this.raw);
      const datestr = text.replaceAll("c", ":").replaceAll("d", ".").replaceAll("p", "+");
      const result = new Date(datestr);

      if (result.toString() === "Invalid Date") {
        throw new Error(`Invalid date frame: ${text}`);
      }

      return result;
    },
    string: (): string => {
      switch (this.code) {
        case MatterCode.StrB64_L0:
        case MatterCode.StrB64_L1:
        case MatterCode.StrB64_L2:
        case MatterCode.StrB64_Big_L0:
        case MatterCode.StrB64_Big_L1:
        case MatterCode.StrB64_Big_L2: {
          const bext = encodeBase64Url(concat(new Uint8Array(this.size.ls), this.raw));

          if (this.size.ls === 0 && bext) {
            if (bext[0] === "A") {
              return bext.slice(1);
            }

            return bext;
          }

          return bext.slice((this.size.ls + 1) % 4);
        }
        case MatterCode.Bytes_L0:
        case MatterCode.Bytes_L1:
        case MatterCode.Bytes_L2:
        case MatterCode.Bytes_Big_L0:
        case MatterCode.Bytes_Big_L1:
        case MatterCode.Bytes_Big_L2:
          return decodeUtf8(this.raw);
        default:
          throw new Error(`Cannot decode matter of code ${this.code} as a string`);
      }
    },
  };
}
