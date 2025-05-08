import { IndexCode, IndexTable } from "./codes.ts";
import { Decoder } from "./decoder.ts";
import { encode } from "./encoder.ts";

export interface IndexerInit {
  code: string;
  raw?: Uint8Array;
  index?: number;
  ondex?: number;
}

export class Indexer {
  static readonly decoder = new Decoder(IndexTable);

  readonly code: string;
  readonly raw: Uint8Array;
  readonly index: number;
  readonly ondex?: number;
  readonly text: string;

  constructor(frame: IndexerInit) {
    const size = IndexTable[frame.code];
    if (!size) {
      throw new Error(`Invalid code: ${frame.code}`);
    }

    this.code = frame.code;
    this.raw = frame.raw ?? new Uint8Array(0);
    this.index = frame.index ?? 0;
    this.ondex = frame.ondex;
    this.text = encode({ code: this.code, raw: this.raw, index: this.index, ondex: this.ondex }, size);
  }

  static signature(alg: string, raw: Uint8Array, index: number): Indexer {
    switch (alg) {
      case "Ed25519":
        return new Indexer({ code: IndexCode.Ed25519_Sig, raw, index });
      default:
        throw new Error(`Unsupported signature algorithm: ${alg}`);
    }
  }
}
