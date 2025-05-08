import { CountCode_10, CountCode_20, CountTable_10, CountTable_20 } from "./codes.ts";
import { Decoder } from "./decoder.ts";
import { encode } from "./encoder.ts";

export interface CounterInit {
  code: string;
  count: number;
}

export class CounterV1 {
  static decoder = new Decoder(CountTable_10);

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

  static attachments(count: number) {
    if (count > 64 ** 2) {
      return new CounterV1({ code: CountCode_10.BigAttachmentGroup, count });
    }

    return new CounterV1({ code: CountCode_10.AttachmentGroup, count });
  }
}

export class CounterV2 {
  static decoder = new Decoder(CountTable_20);

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

  static attachments(count: number) {
    if (count > 64 ** 2) {
      return new CounterV2({ code: CountCode_20.BigAttachmentGroup, count });
    }

    return new CounterV2({ code: CountCode_20.AttachmentGroup, count });
  }
}
