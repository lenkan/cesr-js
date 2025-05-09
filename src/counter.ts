import { CountCode_10, CountCode_20, CountTable_10, CountTable_20 } from "./codes.ts";
import { encode, decode } from "./encoding.ts";

export interface CounterInit {
  code: string;
  count: number;
}

export interface Counter {
  code: string;
  count: number;
  text: string;
}

export class CounterV1 implements Counter {
  readonly code: string;
  readonly count: number;
  readonly text: string;
  readonly name: string;

  constructor(init: CounterInit) {
    this.code = init.code;
    this.count = init.count;
    this.text = encode(init, CountTable_10);
  }

  static decode(qb64: string | Uint8Array) {
    return new CounterV1(decode(qb64, CountTable_10));
  }

  static attachments(count: number) {
    if (count > 64 ** 2) {
      return new CounterV1({ code: CountCode_10.BigAttachmentGroup, count });
    }

    return new CounterV1({ code: CountCode_10.AttachmentGroup, count });
  }
}

export class CounterV2 implements Counter {
  readonly code: string;
  readonly count: number;
  readonly text: string;

  constructor(init: CounterInit) {
    this.code = init.code;
    this.count = init.count;
    this.text = encode(init, CountTable_20);
  }

  static decode(qb64: string | Uint8Array) {
    return new CounterV2(decode(qb64, CountTable_20));
  }

  static attachments(count: number) {
    if (count > 64 ** 2) {
      return new CounterV2({ code: CountCode_20.BigAttachmentGroup, count });
    }

    return new CounterV2({ code: CountCode_20.AttachmentGroup, count });
  }
}
