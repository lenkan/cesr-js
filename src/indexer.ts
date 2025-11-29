import { IndexCode, IndexTableInit } from "./codes.ts";
import { decodeBase64Int, encodeBase64Int } from "./encoding-base64.ts";
import { Frame, type FrameInit, type FrameSize, type ReadResult } from "./frame.ts";

export interface IndexerInit {
  code: string;
  raw: Uint8Array;
  index: number;
  ondex?: number;
}

type IndexCodeTableEntry = FrameSize & { os: number };
const Hards: Record<string, number> = {};
const Table: Record<string, IndexCodeTableEntry> = {};

for (const [key, value] of Object.entries(IndexTableInit)) {
  Hards[key.slice(0, 1)] = value.hs;
  Table[key] = {
    hs: value.hs,
    fs: value.fs ?? 0,
    os: value.os ?? 0,
    ls: value.ls ?? 0,
    ss: value.ss ?? 0,
    xs: value.xs ?? 0,
  };
}

function lookup(input: string | Uint8Array): IndexCodeTableEntry {
  if (typeof input !== "string") {
    input = new TextDecoder().decode(input.slice(0, 4));
  }

  if (input.length === 0) {
    throw new Error("Received empty input code for lookup");
  }

  const hs = Hards[input.slice(0, 1)];
  const hard = input.slice(0, hs ?? 4);
  const entry = Table[hard];

  if (!entry) {
    throw new Error(`Code not found in Indexer table: ${hard}`);
  }

  return entry;
}

function resolveIndexerInit(frame: Frame, entry: IndexCodeTableEntry): IndexerInit {
  const ms = entry.ss - entry.os;
  const os = entry.os;

  const text = encodeBase64Int(frame.soft ?? 0, entry.ss);
  const index = decodeBase64Int(text.slice(0, ms));
  const ondex = os > 0 ? decodeBase64Int(text.slice(ms)) : undefined;

  return {
    code: frame.code,
    raw: frame.raw,
    index,
    ondex,
  };
}

function resolveFrameInit(init: IndexerInit, entry: IndexCodeTableEntry): FrameInit {
  if (entry.os === 0 && init.ondex !== undefined) {
    throw new Error(`Indexer code ${init.code} does not support ondex value, got ${init.ondex}`);
  }

  const ms = entry.ss - entry.os;
  const os = entry.os;

  const index = encodeBase64Int(init.index, ms);
  const ondex = encodeBase64Int(init.ondex ?? 0, os);
  const soft = decodeBase64Int(index + ondex);

  return {
    code: init.code,
    raw: init.raw,
    soft,
    size: entry,
  };
}

export class Indexer extends Frame implements IndexerInit {
  readonly index: number;
  readonly ondex?: number;

  constructor(init: IndexerInit) {
    const entry = lookup(init.code);
    super(resolveFrameInit(init, entry));
    if (entry.os === 0 && init.ondex !== undefined) {
      throw new Error(`Indexer code ${init.code} does not support ondex value, got ${init.ondex}`);
    }
    this.index = init.index;
    this.ondex = init.ondex;
  }

  static readonly Code = IndexCode;

  static peek(input: Uint8Array): ReadResult<Indexer> {
    const entry = lookup(input);
    const result = Frame.peek(input, entry);

    if (!result.frame) {
      return { n: result.n };
    }

    return {
      frame: new Indexer(resolveIndexerInit(result.frame, entry)),
      n: result.n,
    };
  }

  static parse(input: string | Uint8Array): Indexer {
    const entry = lookup(input);
    const frame = Frame.parse(input, entry);

    return new Indexer(resolveIndexerInit(frame, entry));
  }

  /**
   * Create a new Indexer frame.
   *
   * Note: It is recommended to use the helper methods in `Indexer.crypto` instead to ensure
   * the correct code is used for the signature type.
   *
   * @param code The Indexer code, see {@link Indexer.Code}
   * @param raw The raw signature bytes
   * @param index The main index of the signature
   * @param ondex The optional secondary index of the signature
   */
  static from(code: string, raw: Uint8Array, index: number, ondex?: number): Indexer {
    return new Indexer({ code, raw, index, ondex });
  }

  static readonly crypto = {
    ed25519_sig(raw: Uint8Array, index: number, ondex?: number): Indexer {
      if (ondex !== undefined) {
        // TODO: Keripy also checks if index === ondex and then use Crt_Sig
        return Indexer.from(Indexer.Code.Ed25519_Big_Sig, raw, index, ondex);
      }

      if (index > 64) {
        return Indexer.from(Indexer.Code.Ed25519_Big_Crt_Sig, raw, index);
      }

      return Indexer.from(Indexer.Code.Ed25519_Sig, raw, index);
    },
    ed448_sig(raw: Uint8Array, index: number, ondex?: number): Indexer {
      if (ondex !== undefined) {
        if (index > 64 || ondex > 64) {
          return Indexer.from(Indexer.Code.Ed448_Big_Sig, raw, index, ondex);
        }

        return Indexer.from(Indexer.Code.Ed448_Sig, raw, index, ondex);
      }

      if (index > 64) {
        return Indexer.from(Indexer.Code.Ed448_Big_Crt_Sig, raw, index);
      }

      return Indexer.from(Indexer.Code.Ed448_Crt_Sig, raw, index);
    },
    ecdsa_256k1_sig(raw: Uint8Array, index: number): Indexer {
      if (index > 64) {
        return Indexer.from(Indexer.Code.ECDSA_256r1_Big_Crt_Sig, raw, index);
      }

      return Indexer.from(Indexer.Code.ECDSA_256k1_Crt_Sig, raw, index);
    },
  };
}
