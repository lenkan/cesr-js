import type { CodeSize } from "./codes.ts";
import { MatterSize, IndexerSize, CountCode_10, CounterSize_10, CounterSize_20, CountCode_20 } from "./codes.ts";
import { decodeVersion } from "./version.ts";
import { decodeBase64Int, decodeBase64Url } from "./base64.ts";

export type FrameType = "message" | "indexer" | "matter" | "counter_10" | "counter_20";

export interface Frame {
  type: FrameType;
  code: string;
  soft: string;
  count?: number;
  index?: number;
  ondex?: number;
  text: string;
  raw: Uint8Array;
}

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
  code: string;
  count: number;
  table: Record<string, CodeSize>;
}

function readRaw(qb64: string, code: CodeSize): Uint8Array {
  const padSize = (code.hs + code.ss) % 4;
  const leadSize = code.ls ?? 0;
  const raw = decodeBase64Url("A".repeat(padSize) + qb64.slice(code.hs + code.ss)).slice(padSize + leadSize);
  return raw;
}

export interface ParserOptions {
  protocol?: string;
  major?: number;
  table?: Record<string, CodeSize>;
}

export class Parser {
  #buffer: Uint8Array;
  #stack: GroupContext[] = [];
  #protocol = "KERI";
  #major = 1;

  constructor(options: ParserOptions = {}) {
    this.#buffer = new Uint8Array(0);

    this.#protocol = options.protocol ?? "KERI";
    this.#major = options.major ?? 1;

    if (options.table) {
      this.#stack.push({
        code: "",
        table: options.table,
        count: 1,
      });
    }
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

  #readCodeSize(table: Record<string, CodeSize>): CodeSize | null {
    let prefix = "";
    let size: CodeSize | null = null;

    const decoder = new TextDecoder();

    while (!size) {
      if (this.#buffer.length < prefix.length + 1) {
        return null;
      }

      // TODO: Table holds the information about longest code, so we should look it up from there.
      if (prefix.length >= 5) {
        throw new Error(`Expected frame, no code found '${prefix}' ${Object.keys(table)} `);
      }

      prefix = decoder.decode(this.#peekBytes(prefix.length + 1));
      size = table[prefix];
    }

    return size;
  }

  #readCounter(): Frame | null {
    const decoder = new TextDecoder();

    let code: CodeSize | null = null;
    switch (this.#protocol) {
      case "KERI":
      case "ACDC":
        {
          switch (this.#major) {
            case 1: {
              code = this.#readCodeSize(CounterSize_10);
              break;
            }
            case 2: {
              code = this.#readCodeSize(CounterSize_20);
              break;
            }
            default:
              throw new Error(`Unsupported major version ${this.#protocol} ${this.#major}`);
          }
        }
        break;
      default:
        throw new Error(`Unsupported protocol ${this.#protocol}`);
    }

    if (!code || this.#buffer.length < code.ss + code.hs) {
      return null;
    }

    const qb64 = decoder.decode(this.#readBytes(code.ss + code.hs));
    const hard = qb64.slice(0, code.hs);
    const soft = qb64.slice(code.hs);
    const count = decodeBase64Int(soft);

    switch (code.type) {
      case "counter_10": {
        switch (code.prefix) {
          case CountCode_10.ControllerIdxSigs:
          case CountCode_10.WitnessIdxSigs:
            this.#stack.push({ code: code.prefix, table: IndexerSize, count });
            break;
          case CountCode_10.NonTransReceiptCouples:
          case CountCode_10.SealSourceCouples:
          case CountCode_10.FirstSeenReplayCouples:
            this.#stack.push({ code: code.prefix, table: MatterSize, count: count * 2 });
            break;
          case CountCode_10.SealSourceTriples:
            this.#stack.push({ code: code.prefix, table: MatterSize, count: count * 3 });
            break;
          case CountCode_10.TransReceiptQuadruples:
            this.#stack.push({ code: code.prefix, table: MatterSize, count: count * 4 });
            break;
        }
        break;
      }
      case "counter_20": {
        switch (code.prefix) {
          case CountCode_20.ControllerIdxSigs:
          case CountCode_20.WitnessIdxSigs: {
            this.#stack.push({ code: code.prefix, table: IndexerSize, count });
            break;
          }
        }
        break;
      }
      default:
        throw new Error(`Unsupported count code ${code.prefix}`);
    }

    return {
      type: code.type as "counter_10" | "counter_20",
      code: hard,
      soft,
      count,
      text: qb64,
      raw: new Uint8Array(0),
    };
  }

  #readJSON(): Frame | null {
    if (this.#buffer.length < 25) {
      return null;
    }

    const version = decodeVersion(this.#buffer.slice(0, 24));
    if (this.#buffer.length < version.size) {
      return null;
    }

    const frame = this.#buffer.slice(0, version.size);

    this.#protocol = version.protocol;
    this.#major = version.major;
    this.#buffer = this.#buffer.slice(version.size);

    return {
      type: "message",
      code: version.protocol,
      soft: "",
      raw: frame,
      text: new TextDecoder().decode(frame),
    };
  }

  #readMatter(table: Record<string, CodeSize>): Frame | null {
    const code = this.#readCodeSize(table);

    if (!code) {
      return null;
    }

    const decoder = new TextDecoder();
    if (this.#buffer.length < code.hs + code.ss) {
      return null;
    }

    const prefix = decoder.decode(this.#peekBytes(code.hs + code.ss));
    const hard = prefix.slice(0, code.hs);
    const soft = prefix.slice(code.hs);
    const size = code.fs ?? code.hs + code.ss + decodeBase64Int(soft) * 4;

    if (this.#buffer.length < size) {
      return null;
    }

    const qb64 = decoder.decode(this.#readBytes(size));

    return {
      type: code.type as FrameType,
      code: hard,
      soft,
      count: soft.length ? decodeBase64Int(soft) : undefined,
      text: qb64,
      raw: readRaw(qb64, code),
    };
  }

  /**
   * Returns the next frame from the underlying buffer.
   *
   * If the buffer is empty, or does not contain a complete frame, null is returned.
   */
  read(): Frame | null {
    const input = this.#buffer;

    if (input.length === 0) {
      return null;
    }

    const start = input[0];
    switch (start) {
      case 0b01111011:
        return this.#readJSON();
      case 0b00101101:
        return this.#readCounter();
    }

    const context = this.#context;
    if (context && context.count > 0) {
      const result = this.#readMatter(context.table);

      if (result) {
        context.count--;

        if (context.count === 0) {
          this.#stack.pop();
        }
      }

      return result;
    }

    throw new Error("Unexpected frame type");
  }

  /**
   * Updates the underlying buffer with new data.
   *
   * @param source The source data to append to the buffer.
   */
  update(source: Uint8Array | string): void {
    if (typeof source === "string") {
      this.update(new TextEncoder().encode(source));
    } else {
      this.#buffer = concat(this.#buffer, source);
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
    return parseSync(new TextEncoder().encode(input));
  }

  const parser = new Parser();
  parser.update(input);

  while (!parser.finished) {
    const frame = parser.read();

    if (!frame) {
      throw new Error("Unexpected end of stream");
    }

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
    parser.update(chunk);

    while (true) {
      const frame = parser.read();

      if (!frame) {
        // No complete frames, wait for more data
        break;
      }

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
