import { CodeTable, type CodeTableEntry } from "./code-table.ts";
import { IndexCode, IndexTableInit } from "./codes.ts";
import { Frame, type ReadResult } from "./frame.ts";

export interface IndexerInit {
  code: string;
  raw: Uint8Array;
  index: number;
  ondex?: number;
}

export class Indexer extends Frame implements IndexerInit {
  readonly index: number;
  readonly ondex?: number;
  readonly size: CodeTableEntry;

  constructor(init: IndexerInit) {
    super({
      code: init.code,
      raw: init.raw,
      soft: init.index,
      other: init.ondex,
      size: Indexer.Table.lookup(init.code),
    });
    this.index = init.index;
    this.ondex = init.ondex;
    this.size = Indexer.Table.lookup(this.code);
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
      frame: Indexer.from({
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

    return Indexer.from({
      code: frame.code,
      raw: frame.raw,
      index: frame.soft ?? 0,
      ondex: frame.other,
    });
  }

  static from(init: IndexerInit): Indexer;
  static from(code: string, raw: Uint8Array, index: number, ondex?: number): Indexer;
  static from(init: IndexerInit | string, raw?: Uint8Array, index?: number, ondex?: number): Indexer {
    if (typeof init === "string") {
      if (raw === undefined || index === undefined) {
        throw new Error("Raw and index must be provided when using code string");
      }
      return new Indexer({ code: init, raw, index, ondex });
    }

    return new Indexer(init);
  }

  static ed25519_sig(raw: Uint8Array, index: number, ondex?: number): Indexer {
    return Indexer.from(Indexer.Code.Ed25519_Sig, raw, index, ondex);
  }
}
