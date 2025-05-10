import { decodeVersion, Message } from "./version.ts";
import { CountCode_10, CountCode_20, CountTable_10, CountTable_20, IndexTable, MatterTable } from "./codes.ts";
import type { Counter, Frame, Indexer, Matter } from "./encoding.ts";
import { decodeStream } from "./encoding.ts";

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

interface Context {
  type: "counter" | "matter" | "indexer";
  count: number;
}

export interface ParserOptions {
  version?: number;
  context?: Context;
}

class Parser {
  #buffer: Uint8Array;
  #stack: Context[] = [];
  #version: number;

  constructor(options: ParserOptions = {}) {
    this.#buffer = new Uint8Array(0);
    this.#version = options.version ?? 1;

    if (options.context) {
      this.#stack.push(options.context);
    }
  }

  get #context(): Context | null {
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

  #readMatter(): Matter | null {
    const result = decodeStream(this.#buffer, MatterTable);
    this.#buffer = this.#buffer.slice(result.n);
    return result.frame;
  }

  #readCounter(): Counter | null {
    switch (this.#version) {
      case 1:
        return this.#readCounterV1();
      case 2:
        return this.#readCounterV2();
      default:
        throw new Error(`Unsupported protocol ${this.#version}`);
    }
  }

  #readCounterV1(): Counter | null {
    const result = decodeStream(this.#buffer, CountTable_10);
    this.#buffer = this.#buffer.slice(result.n);

    if (!result.frame) {
      return null;
    }

    const frame = result.frame;
    switch (frame.code) {
      case CountCode_10.ControllerIdxSigs:
      case CountCode_10.WitnessIdxSigs:
        this.#stack.push({ type: "indexer", count: frame.count });
        break;
      case CountCode_10.NonTransReceiptCouples:
      case CountCode_10.SealSourceCouples:
      case CountCode_10.FirstSeenReplayCouples:
        this.#stack.push({ type: "matter", count: frame.count * 2 });
        break;
      case CountCode_10.SealSourceTriples:
        this.#stack.push({ type: "matter", count: frame.count * 3 });
        break;
      case CountCode_10.TransReceiptQuadruples:
        this.#stack.push({ type: "matter", count: frame.count * 4 });
        break;
    }

    return result.frame;
  }

  #readCounterV2(): Counter | null {
    const result = decodeStream(this.#buffer, CountTable_20);
    this.#buffer = this.#buffer.slice(result.n);

    if (!result.frame) {
      return null;
    }

    const frame = result.frame;
    switch (frame.code) {
      case CountCode_20.ControllerIdxSigs:
      case CountCode_20.WitnessIdxSigs: {
        this.#stack.push({ type: "indexer", count: frame.count });
        break;
      }
    }

    return result.frame;
  }

  #readIndexer(): Indexer | null {
    const result = decodeStream(this.#buffer, IndexTable);
    this.#buffer = this.#buffer.slice(result.n);

    if (!result.frame) {
      return null;
    }

    return result.frame;
  }

  #readContextual(): Frame | null {
    const context = this.#context;

    if (!context) {
      throw new Error("No context available");
    }

    let frame: Frame | null = null;
    switch (context.type) {
      case "counter":
        frame = this.#readCounter();
        break;
      case "matter":
        frame = this.#readMatter();
        break;
      case "indexer":
        frame = this.#readIndexer();
        break;
      default:
        throw new Error(`Unknown context type ${context.type}`);
    }

    if (!frame) {
      return null;
    }

    if (context && context.count > 0) {
      context.count--;

      if (context.count === 0) {
        this.#stack.pop();
      }
    }

    return frame;
  }

  #readJSON(): Frame | null {
    if (this.#buffer.length < 25) {
      return null;
    }

    const version = decodeVersion(this.#buffer.slice(0, 24));
    if (this.#buffer.length < version.size) {
      return null;
    }

    this.#version = version.major;
    const frame = this.#readBytes(version.size);

    return new Message(version, new TextDecoder().decode(frame));
  }

  #update(source: Uint8Array | string): void {
    if (typeof source === "string") {
      this.#update(new TextEncoder().encode(source));
    } else {
      this.#buffer = concat(this.#buffer, source);
    }
  }

  #read(): Frame | null {
    const start = this.#buffer[0];
    switch (start) {
      case 0b01111011:
        return this.#readJSON();
      case 0b00101101: {
        return this.#readCounter();
      }
      default: {
        return this.#readContextual();
      }
    }
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
    return this.#buffer.length === 0;
  }
}

/**
 * Parses CESR frames from an incoming stream of bytes.
 *
 * Inspect the {@link Frame.type} property to determine the type of frame.
 *
 *
 * @param input Incoming stream of bytes
 * @returns An iterable of CESR frames
 */
export function* parseSync(input: Uint8Array | string): IterableIterator<Frame> {
  if (typeof input === "string") {
    input = new TextEncoder().encode(input);
  }

  const parser = new Parser();
  for (const frame of parser.parse(input)) {
    yield frame;
  }
}

/**
 * Parses CESR frames from an incoming stream of bytes.
 *
 * Inspect the {@link Frame.type} property to determine the type of frame.
 *
 *
 * @param input Incoming stream of bytes
 * @returns An async iterable of CESR frames
 */
export async function* parse(input: ParserInput): AsyncIterableIterator<Frame> {
  const parser = new Parser();

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
    return ReadableStream.from([new TextEncoder().encode(input)]);
  }

  if (input instanceof Uint8Array) {
    return ReadableStream.from([input]);
  }

  return input;
}
