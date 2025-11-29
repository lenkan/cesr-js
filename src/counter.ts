import { CountCode_10, CountCode_20 } from "./codes.ts";
import { Frame, type FrameInit, type FrameSizeInit, type ReadResult } from "./frame.ts";
import { decodeUtf8 } from "./encoding-utf8.ts";

export interface CounterInit {
  type: string;
  count: number;
}

function resolveCountCode(init: CounterInit): string {
  if (init.count < 64 ** 2) {
    return `-${init.type}`;
  }

  return `--${init.type}`;
}

function resolveFrameInit(init: CounterInit): FrameInit {
  const code = resolveCountCode(init);
  return {
    code,
    soft: init.count,
    size: lookupCounterSize(code),
  };
}

function lookupCounterSize(input: Uint8Array | string): FrameSizeInit {
  if (typeof input !== "string") {
    input = decodeUtf8(input.slice(0, 4));
  }

  switch (input.charAt(0)) {
    case "-":
      switch (input.charAt(1)) {
        case "-":
          return { hs: 3, ss: 5, fs: 8 };
        case "_":
          return { hs: 5, ss: 3, fs: 8 };
        default:
          return { hs: 2, ss: 2, fs: 4 };
      }
  }

  throw new Error(`Unknown code ${input.slice(0, 4)}`);
}

function createEncoder<T extends Record<string, string>>(types: T): { [key in keyof T]: (count: number) => Counter } {
  return Object.entries(types).reduce(
    (acc, [key, type]) => {
      acc[key as keyof T] = (count) => new Counter({ type, count });
      return acc;
    },
    {} as { [key in keyof T]: (count: number) => Counter },
  );
}

export class Counter extends Frame implements CounterInit {
  constructor(init: CounterInit) {
    super(resolveFrameInit(init));
  }

  get type() {
    return this.code.replace(/^-+/, "");
  }

  get count() {
    return this.soft ?? 0;
  }

  static peek(input: string | Uint8Array): ReadResult<Counter> {
    if (input.length < 4) {
      return { n: 0 };
    }

    const entry = lookupCounterSize(input);
    const result = Frame.peek(input, entry);

    if (!result.frame) {
      return { n: result.n };
    }

    return {
      n: result.n,
      frame: new Counter({
        type: result.frame.code.replace(/^-+/, ""),
        count: result.frame.soft ?? 0,
      }),
    };
  }

  static parse(input: string | Uint8Array): Counter {
    const entry = lookupCounterSize(input);
    const frame = Frame.parse(input, entry);

    return new Counter({
      type: frame.code.replace(/^-+/, ""),
      count: frame.soft ?? 0,
    });
  }

  static readonly Code = {
    v1: CountCode_10,
    v2: CountCode_20,
  };

  static readonly v1 = createEncoder(CountCode_10);
  static readonly v2 = createEncoder(CountCode_20);
}
