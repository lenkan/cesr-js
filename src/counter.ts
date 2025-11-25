import { CountCode_10, CountCode_20 } from "./codes.ts";
import { Frame, type FrameInit, type ReadResult } from "./frame.ts";
import { resolveEntry, type CodeTableEntry } from "./code-table.ts";
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

function lookupCounterSize(input: Uint8Array | string): CodeTableEntry {
  if (typeof input !== "string") {
    input = decodeUtf8(input.slice(0, 4));
  }

  switch (input.charAt(0)) {
    case "-":
      switch (input.charAt(1)) {
        case "-":
          return resolveEntry({ hs: 3, ss: 5, fs: 8 });
        case "_":
          return resolveEntry({ hs: 5, ss: 3, fs: 8 });
        default:
          return resolveEntry({ hs: 2, ss: 2, fs: 4 });
      }
  }

  throw new Error(`Unknown code ${input.slice(0, 4)}`);
}

export type CounterEncoder<T extends Record<string, string>> = {
  [key in keyof T]: (count: number) => Counter;
};

export type CountCode_10 = typeof CountCode_10;
export type CountCode_20 = typeof CountCode_20;

export type CountEncoder_10 = CounterEncoder<CountCode_10>;
export type CountEncoder_20 = CounterEncoder<CountCode_20>;

function createEncoder<T extends Record<string, string>>(codes: T): CounterEncoder<T> {
  return Object.entries(codes).reduce((acc, [key, code]) => {
    acc[key as keyof T] = (count: number): Counter => new Counter({ type: code, count });
    return acc;
  }, {} as CounterEncoder<T>);
}

export class Counter extends Frame implements CounterInit {
  readonly count: number;
  readonly type: string;

  constructor(init: CounterInit) {
    super(resolveFrameInit(init));
    this.count = init.count;
    this.type = init.type;
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

  static readonly Code = Object.freeze({
    v1: CountCode_10,
    v2: CountCode_20,
  });

  static readonly v1: CountEncoder_10 = createEncoder(CountCode_10);
  static readonly v2: CountEncoder_20 = createEncoder(CountCode_20);
}
