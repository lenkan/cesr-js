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
  #buffer: Uint8Array | null;

  constructor(stream: AsyncIterableIterator<Uint8Array>) {
    this.#stream = stream;
  }

  async #readBytes(size: number): Promise<Uint8Array | null> {
    if (typeof size !== "number") {
      throw new Error(`Size must be a number, got '${size}'`);
    }

    while (!this.#buffer || this.#buffer.length < size) {
      const result = await this.#stream.next();

      if (result.done) {
        return null;
      }

      this.#buffer = concat(this.#buffer ?? new Uint8Array(0), result.value);
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

      const code = this.#decoder.decode(start);
      if (code === "{") {
        const prefix = this.#decoder.decode(start) + (await this.#readCharacters(22));
        const version = parseVersion(prefix);
        const text = prefix + (await this.#readCharacters(version.size - prefix.length));
        yield { text, type: "json" };
      } else if (code === "-") {
        for await (const frame of this.readCounter()) {
          yield frame;
        }
      } else {
        throw new Error(`Unexpected start of stream '${code}'`);
      }
    }
  }
}

async function* iter<T>(iterator: AsyncIterable<T>): AsyncIterableIterator<T> {
  for await (const item of iterator) {
    yield item;
  }
}

export async function* parse(input: AsyncIterable<Uint8Array>): AsyncIterableIterator<Message> {
  const decoder = new Parser(iter(input));

  let payload: MessagePayload | null = null;
  let group: string | null = null;
  let attachments: Record<string, string[]> = {};

  for await (const frame of decoder.read()) {
    if (frame === null) {
      return;
    }

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
