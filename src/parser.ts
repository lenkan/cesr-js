import { CountCode_10, CountCode_20, CountTable_10, CountTable_20, IndexTable, MatterTable } from "./codes.ts";
import type { CodeTable, Counter, FrameData, MessageVersion } from "./encoding.ts";
import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";
import { encoding } from "./encoding.ts";

export type Frame =
  | {
      type: "matter";
      code: string;
      text: string;
      raw: Uint8Array;
    }
  | {
      type: "counter";
      code: string;
      count: number;
      text: string;
    }
  | {
      type: "indexer";
      code: string;
      index: number;
      ondex: number;
      raw: Uint8Array;
      text: string;
    }
  | {
      type: "message";
      version: MessageVersion;
      text: string;
    };

function concat(a: Uint8Array, b: Uint8Array) {
  if (a.length === 0) {
    return b;
  }

  if (b.length === 0) {
    return a;
  }

  const merged = new Uint8Array(a.length + b.length);
  merged.set(a);
  merged.set(b, a.length);
  return merged;
}

interface GroupContext {
  counter: Counter;

  /**
   * How many bytes have been consumed in this group
   */
  quadlets: number;

  /**
   * How many frames have been decoded
   */
  frames: number;
}

function isContextComplete(context: GroupContext, version: number): boolean {
  switch (version) {
    case 1:
      switch (context.counter.code) {
        case CountCode_10.ControllerIdxSigs:
        case CountCode_10.WitnessIdxSigs:
          return context.frames === context.counter.count;
        case CountCode_10.SealSourceCouples:
        case CountCode_10.FirstSeenReplayCouples:
        case CountCode_10.NonTransReceiptCouples:
          return context.frames === context.counter.count * 2;
        case CountCode_10.SealSourceTriples:
          return context.frames === context.counter.count * 3;
        case CountCode_10.TransReceiptQuadruples:
          return context.frames === context.counter.count * 4;
        case CountCode_10.AttachmentGroup:
        case CountCode_10.BigAttachmentGroup:
          return context.quadlets === context.counter.count;
        case CountCode_10.KERIACDCGenusVersion:
          return true;
        default:
          return false;
      }
    case 2: {
      switch (context.counter.code) {
        case CountCode_20.KERIACDCGenusVersion:
          return true;
        default:
          return context.quadlets === context.counter.count;
      }
    }
    default:
      throw new Error(`Unknown version: ${version}`);
  }
}

export interface ParserOptions {
  version?: number;
}

class Parser {
  #buffer: Uint8Array;
  #stack: GroupContext[] = [];
  #version: number;

  constructor(options: ParserOptions = {}) {
    this.#buffer = new Uint8Array(0);
    this.#version = options.version ?? 1;
  }

  get #context(): GroupContext | null {
    return this.#stack[this.#stack.length - 1] ?? null;
  }

  #peekBytes(size: number): Uint8Array {
    return this.#buffer.slice(0, size);
  }

  #readBytes(size: number): Uint8Array {
    const result = this.#peekBytes(size);
    this.#buffer = this.#buffer.slice(size);
    return result;
  }

  #readFrame(table: CodeTable): Required<FrameData> | null {
    const result = encoding.decodeStream(this.#buffer, table);
    this.#buffer = this.#buffer.slice(result.n);
    return result.frame;
  }

  #readIndexer(): Frame | null {
    const frame = this.#readFrame(IndexTable);

    if (!frame) {
      return null;
    }

    return {
      type: "indexer",
      code: frame.code,
      index: frame.index,
      ondex: frame.ondex,
      raw: frame.raw,
      text: frame.text,
    };
  }

  #readMatter(): Frame | null {
    const frame = this.#readFrame(MatterTable);

    if (!frame) {
      return null;
    }

    return {
      type: "matter",
      code: frame.code,
      text: frame.text,
      raw: frame.raw,
    };
  }

  #readCounter(): Frame | null {
    let counter: Counter | null = null;

    switch (this.#version) {
      case 1:
        counter = this.#readFrame(CountTable_10);
        break;
      case 2:
        counter = this.#readFrame(CountTable_20);
        break;
      default:
        throw new Error(`Unsupported protocol ${this.#version}`);
    }

    if (!counter) {
      return null;
    }

    if (counter.code === CountCode_10.KERIACDCGenusVersion) {
      const genus = encoding.decodeGenus(counter.text);
      this.#version = genus.major;
    } else {
      this.#stack.push({ counter, quadlets: 0, frames: 0 });
    }

    return {
      type: "counter",
      code: counter.code,
      count: counter.count,
      text: counter.text,
    };
  }

  #popContext(): void {
    const context = this.#stack.pop();
    if (!context) {
      return;
    }

    const outer = this.#context;
    if (!outer) {
      return;
    }

    if (outer) {
      outer.frames += context.frames;
      outer.quadlets += context.quadlets;

      // +1 for the group
      outer.frames += 1;
      outer.quadlets += context.counter.text.length / 4;

      if (isContextComplete(outer, this.#version)) {
        return this.#popContext();
      }
    }
  }

  #readJSON(): Frame | null {
    if (this.#buffer.length < 25) {
      return null;
    }

    const version = encoding.decodeVersionString(this.#buffer.slice(0, 24));
    if (this.#buffer.length < version.size) {
      return null;
    }

    const frame = this.#readBytes(version.size);

    return {
      type: "message",
      version: version,
      text: decodeUtf8(frame),
    };
  }

  #update(source: Uint8Array | string): void {
    if (typeof source === "string") {
      this.#update(encodeUtf8(source));
    } else {
      this.#buffer = concat(this.#buffer, source);
    }
  }

  #read(): Frame | null {
    const start = this.#buffer[0];
    const context = this.#context;

    switch (start) {
      case 0b01111011:
        return this.#readJSON();
      case 0b00101101:
        return this.#readCounter();
    }

    if (!context) {
      throw new Error(`Unsupported cold start byte: 0b${start.toString(2)}`);
    }

    let frame: Frame | null = null;
    switch (this.#version) {
      case 1:
        switch (context.counter.code) {
          case CountCode_10.ControllerIdxSigs:
          case CountCode_10.TransIdxSigGroups:
          case CountCode_10.TransLastIdxSigGroups:
          case CountCode_10.WitnessIdxSigs: {
            frame = this.#readIndexer();
            break;
          }
          default: {
            frame = this.#readMatter();
            break;
          }
        }
        break;
      case 2: {
        switch (context.counter.code) {
          case CountCode_20.WitnessIdxSigs:
          case CountCode_20.BigWitnessIdxSigs:
          case CountCode_20.TransIdxSigGroups:
          case CountCode_20.BigTransIdxSigGroups:
          case CountCode_20.TransLastIdxSigGroups:
          case CountCode_20.BigTransLastIdxSigGroups:
          case CountCode_20.BigControllerIdxSigs:
          case CountCode_20.ControllerIdxSigs: {
            frame = this.#readIndexer();
            break;
          }
          default: {
            frame = this.#readMatter();
            break;
          }
        }
      }
    }

    if (!frame) {
      return null;
    }

    context.quadlets += frame.text.length / 4;
    context.frames += 1;

    if (isContextComplete(context, this.#version)) {
      this.#popContext();
    }

    return frame;
  }

  *parse(source: Uint8Array | string): IterableIterator<Frame> {
    this.#update(source);

    while (this.#buffer.length > 0) {
      const frame = this.#read();

      if (!frame) {
        return null;
      }

      yield frame;
    }
  }

  get finished() {
    return this.#buffer.length === 0 && !this.#context;
  }
}

/**
 * Parses CESR frames from an incoming stream of bytes.
 *
 * @param input Incoming stream of bytes
 * @returns An iterable of CESR frames
 */
export function* parseSync(input: Uint8Array | string, options: ParserOptions = {}): IterableIterator<Frame> {
  if (typeof input === "string") {
    input = encodeUtf8(input);
  }

  const parser = new Parser(options);

  for (const frame of parser.parse(input)) {
    yield frame;
  }

  if (!parser.finished) {
    throw new Error("Unexpected end of stream");
  }
}

/**
 * Parses CESR frames from an incoming stream of bytes.
 *
 * @param input Incoming stream of bytes
 * @returns An async iterable of CESR frames
 */
export async function* parse(input: ParserInput, options: ParserOptions): AsyncIterableIterator<Frame> {
  const parser = new Parser(options);

  for await (const chunk of resolveInput(input)) {
    for (const frame of parser.parse(chunk)) {
      yield frame;
    }
  }

  if (!parser.finished) {
    throw new Error("Unexpected end of stream");
  }
}

export type ParserInput = Uint8Array | string | AsyncIterable<Uint8Array>;

function resolveInput(input: ParserInput): AsyncIterable<Uint8Array> {
  if (typeof input === "string") {
    return ReadableStream.from([encodeUtf8(input)]);
  }

  if (input instanceof Uint8Array) {
    return ReadableStream.from([input]);
  }

  return input;
}
