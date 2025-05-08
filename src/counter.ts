import { CountCode_10, CountCode_20, CountSchemeTable, CountTable_10, CountTable_20 } from "./codes.ts";
import { decode } from "./decoder.ts";
import { encode } from "./encoder.ts";

export interface CounterInit {
  code: string;
  count: number;
}

export class CounterV1 {
  static sizes = CountTable_10;
  static hards = CountSchemeTable;

  readonly code: string;
  readonly count: number;
  readonly text: string;

  constructor(init: CounterInit) {
    const size = CountTable_10[init.code];
    if (!size) {
      throw new Error(`Invalid code: ${init.code}`);
    }

    this.code = init.code;
    this.count = init.count;
    this.text = encode(init, size);
  }

  static decode(qb64: string | Uint8Array) {
    return new CounterV1(decode(qb64, CounterV1));
  }

  static attachments(count: number) {
    if (count > 64 ** 2) {
      return new CounterV1({ code: CountCode_10.BigAttachmentGroup, count });
    }

    return new CounterV1({ code: CountCode_10.AttachmentGroup, count });
  }
}

export class CounterV2 {
  static sizes = CountTable_20;
  static hards = CountSchemeTable;

  readonly code: string;
  readonly count: number;
  readonly text: string;

  constructor(init: CounterInit) {
    const size = CountTable_20[init.code];
    if (!size) {
      throw new Error(`Invalid code: ${init.code}`);
    }

    this.code = init.code;
    this.count = init.count;
    this.text = encode(init, size);
  }

  static decode(qb64: string | Uint8Array) {
    return new CounterV2(decode(qb64, CounterV2));
  }

  static attachments(count: number) {
    if (count > 64 ** 2) {
      return new CounterV2({ code: CountCode_20.BigAttachmentGroup, count });
    }

    return new CounterV2({ code: CountCode_20.AttachmentGroup, count });
  }
}
