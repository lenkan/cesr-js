import { CodeTable } from "./code-table.ts";
import { IndexCode, IndexTableInit } from "./codes.ts";
import { Frame, type ReadResult } from "./frame.ts";

export interface IndexerInit {
  code: string;
  raw: Uint8Array;
  index: number;
  ondex?: number;
}

function createCryptoIndexer(code: string) {
  return (raw: Uint8Array, index: number, ondex?: number): Indexer => {
    return new Indexer({ code, raw, index, ondex });
  };
}

const CryptoIndexer = {
  ed25519_sig: createCryptoIndexer(IndexCode.Ed25519_Sig),
  ed448_sig: createCryptoIndexer(IndexCode.Ed448_Sig),
};

export type CryptoIndexer = typeof CryptoIndexer;

export class Indexer extends Frame implements IndexerInit {
  constructor(init: IndexerInit) {
    super({
      code: init.code,
      raw: init.raw,
      soft: init.index,
      other: init.ondex,
      size: Indexer.Table.lookup(init.code),
    });
  }

  get index() {
    return this.soft ?? 0;
  }

  get ondex() {
    return this.other ?? undefined;
  }

  static readonly Table = new CodeTable(IndexTableInit);
  static readonly Code = IndexCode;

  static peek(input: Uint8Array): ReadResult<Indexer> {
    const entry = Indexer.Table.lookup(input);
    const result = Frame.peek(input, entry);

    if (!result.frame) {
      return { n: result.n };
    }

    return {
      frame: new Indexer({
        code: result.frame.code,
        raw: result.frame.raw,
        index: result.frame.soft ?? 0,
        ondex: result.frame.other,
      }),
      n: result.n,
    };
  }

  static parse(input: string | Uint8Array): Indexer {
    const entry = Indexer.Table.lookup(input);
    const frame = Frame.parse(input, entry);

    return new Indexer({
      code: frame.code,
      raw: frame.raw,
      index: frame.soft ?? 0,
      ondex: frame.other,
    });
  }

  static from(code: string, raw: Uint8Array, index: number, ondex?: number): Indexer {
    return new Indexer({ code, raw, index, ondex });
  }

  static readonly crypto = CryptoIndexer;
}
