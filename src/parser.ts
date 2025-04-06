import { parseVersion } from "./version.ts";
import { decodeBase64Int } from "./base64.ts";
import { type CounterCodeSize, IndexerSize, MatterSize, CounterSize_10, CountCode_10 } from "./codes.ts";
import type { DataObject } from "./data-type.ts";

interface CountFrame {
  type: "counter";
  count: number;
  code: string;
  text: string;
}

interface IndexedFrame {
  type: "indexer";
  code: string;
  text: string;
}

interface MatterFrame {
  type: "matter";
  code: string;
  text: string;
}

interface JsonFrame {
  type: "json";
  text: string;
}

type Frame = CountFrame | IndexedFrame | MatterFrame | JsonFrame;

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

class Parser {
  #decoder = new TextDecoder();
  #stream: AsyncIterableIterator<Uint8Array<ArrayBufferLike>>;
  #buffer: Uint8Array;

  constructor(stream: AsyncIterableIterator<Uint8Array>) {
    this.#stream = stream;
    this.#buffer = new Uint8Array(0);
  }

  async #readBytes(size: number): Promise<Uint8Array | null> {
    if (typeof size !== "number") {
      throw new Error(`Size must be a number, got '${size}'`);
    }

    while (this.#buffer.length < size) {
      const result = await this.#stream.next();

      if (result.done) {
        return null;
      }

      this.#buffer = concat(this.#buffer, result.value);
    }

    const chunk = this.#buffer.slice(0, size);
    this.#buffer = this.#buffer.slice(size);
    return chunk;
  }

  async #readCharacters(count: number): Promise<string> {
    const chunk = await this.#readBytes(count);
    return this.#decoder.decode(chunk);
  }

  async #readIndexer(): Promise<IndexedFrame> {
    let code = "";

    while (code.length < 4) {
      const next = await this.#readBytes(1);
      if (next === null) {
        throw new Error("Unexpected end of stream");
      }

      code += this.#decoder.decode(next);
      const size = IndexerSize[code];

      if (size && size.fs) {
        const qb64 = await this.#readCharacters(size.fs - size.hs);
        return { type: "indexer", code, text: qb64 };
      }
    }

    throw new Error(`Unexpected end of stream '${code}'`);
  }

  async #readPrimitive(): Promise<MatterFrame> {
    let code = "";
    while (code.length < 4) {
      const next = await this.#readBytes(1);
      if (next === null) {
        throw new Error("Unexpected end of stream");
      }

      code += this.#decoder.decode(next);
      const size = MatterSize[code];

      if (size && size.fs !== null) {
        const qb64 = await this.#readCharacters(size.fs - size.hs);
        return { code, type: "matter", text: qb64 };
      }
    }

    throw new Error(`Unexpected end of stream '${code}'`);
  }

  private async *readCounter(): AsyncIterableIterator<Frame> {
    let code = "-";

    let size: CounterCodeSize | null = null;
    while (!size && code.length < 4) {
      const next = await this.#readBytes(1);
      if (next === null) {
        throw new Error("Unexpected end of stream");
      }

      code += this.#decoder.decode(next);
      size = CounterSize_10[code];
      if (size && size.fs !== null) {
        const qb64 = await this.#readCharacters(size.fs - size.hs);
        let count = decodeBase64Int(qb64);
        yield { code, type: "counter", count, text: qb64 };

        switch (code) {
          case CountCode_10.ControllerIdxSigs:
          case CountCode_10.WitnessIdxSigs: {
            while (count > 0) {
              yield this.#readIndexer();
              count--;
            }

            break;
          }
          case CountCode_10.NonTransReceiptCouples:
          case CountCode_10.SealSourceCouples:
          case CountCode_10.FirstSeenReplayCouples: {
            while (count > 0) {
              yield this.#readPrimitive();
              yield this.#readPrimitive();
              count--;
            }
            break;
          }
        }
      }
    }
  }

  async *read(): AsyncIterableIterator<Frame> {
    while (true) {
      const start = await this.#readBytes(1);
      if (start === null) {
        return;
      }

      const tritet = start[0] >>> 5;

      switch (tritet) {
        case 0b011: {
          const next = await this.#readBytes(22);
          if (!next) {
            throw new Error(`Unexpected end of stream`);
          }

          const prefix = concat(start, next);
          const version = parseVersion(prefix);
          const rest = await this.#readBytes(version.size - prefix.length);
          if (!rest) {
            throw new Error(`Unexpected end of stream`);
          }

          const message = concat(prefix, rest);
          const text = this.#decoder.decode(message);
          yield { text, type: "json" };
          break;
        }
        case 0b001: {
          yield* this.readCounter();
          break;
        }
        default:
          throw new Error(`Unsupported cold start tritet 0b${tritet.toString(2).padStart(3, "0")}`);
      }
    }
  }
}

async function* iter<T>(iterator: AsyncIterable<T>): AsyncIterableIterator<T> {
  for await (const item of iterator) {
    yield item;
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
export async function* read(input: AsyncIterable<Uint8Array>): AsyncIterableIterator<Frame> {
  const decoder = new Parser(iter(input));

  for await (const frame of decoder.read()) {
    if (frame === null) {
      return;
    }

    yield frame;
  }
}

/**
 * Parses JSON messages with CESR attachments from an incoming stream of bytes.
 *
 * @param input Incoming stream of bytes
 * @returns An async iterable of messages with attachments
 */
export async function* parse(input: AsyncIterable<Uint8Array>): AsyncIterableIterator<Message> {
  let payload: MessagePayload | null = null;
  let group: string | null = null;
  let attachments: Record<string, string[]> = {};

  for await (const frame of read(input)) {
    if (frame.type === "json") {
      if (payload) {
        yield { payload, attachments };
      }

      payload = JSON.parse(frame.text);
      attachments = {};
      group = null;
    } else if (frame.code.startsWith("-")) {
      group = frame.code;
    } else if (group) {
      attachments[group] = [...(attachments[group] ?? []), frame.code + frame.text];
    }
  }

  if (payload || Object.keys(attachments).length > 0) {
    yield { payload: payload ?? {}, attachments };
  }
}

export type MessagePayload = DataObject;

export interface Message {
  payload: MessagePayload;
  attachments: Record<string, string[]>;
}
