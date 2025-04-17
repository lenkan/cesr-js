import { parseVersion } from "./version.ts";
import type { CodeSize } from "./codes.ts";
import { MatterSize, IndexerSize, CountCode_10, CounterSize_10 } from "./codes.ts";
import type { DataObject } from "./data-type.ts";
import { decodeBase64Int } from "./base64.ts";
import { decode, type Frame } from "./cesr-encoding.ts";

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
  table: Record<string, CodeSize>;
  count: number;
}

class Parser {
  #decoder = new TextDecoder();
  #buffer: Uint8Array;
  #group: GroupContext | null = null;

  constructor() {
    this.#buffer = new Uint8Array(0);
  }

  #readJsonFrame(): Frame | null {
    if (this.#buffer.length < 24) {
      return null;
    }

    const version = parseVersion(this.#buffer.slice(0, 23));
    if (this.#buffer.length < version.size) {
      return null;
    }

    const frame = this.#buffer.slice(0, version.size);
    this.#buffer = this.#buffer.slice(version.size);

    return {
      type: "json",
      code: "JSON",
      soft: "",
      text: this.#decoder.decode(frame),
    };
  }

  #readFrame(table: Record<string, CodeSize>): Frame | null {
    const result = decode(this.#buffer, table);

    if (!result.frame) {
      return null;
    }

    this.#buffer = this.#buffer.slice(result.n);

    if (result.frame.type === "counter_10") {
      const count = decodeBase64Int(result.frame.soft);
      switch (result.frame.code) {
        case CountCode_10.ControllerIdxSigs:
        case CountCode_10.WitnessIdxSigs:
          this.#group = { code: result.frame.code, table: IndexerSize, count };
          break;
        case CountCode_10.NonTransReceiptCouples:
        case CountCode_10.SealSourceCouples:
        case CountCode_10.FirstSeenReplayCouples:
          this.#group = { code: result.frame.code, table: MatterSize, count: count * 2 };
          break;
      }
    }

    return result.frame;
  }

  #read(): Frame | null {
    if (this.#buffer.length === 0) {
      return null;
    }

    const group = this.#group;
    if (group && group.count > 0) {
      const result = this.#readFrame(group.table);

      if (result) {
        group.count--;
      }

      return result;
    }

    const tritet = this.#buffer[0] >>> 5;

    switch (tritet) {
      case 0b011: {
        return this.#readJsonFrame();
      }
      case 0b001: {
        return this.#readFrame(CounterSize_10);
      }
      default:
        throw new Error(`Unsupported cold start tritet 0b${tritet.toString(2).padStart(3, "0")}`);
    }
  }

  /**
   * Parses CESR frames from the source buffer.
   *
   * @param source
   * @returns
   */
  *parse(source: Uint8Array): IterableIterator<Frame> {
    this.#buffer = concat(this.#buffer, source);

    while (!this.finished) {
      const result = this.#read();

      if (!result) {
        return;
      }

      yield result;
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
 * @returns An async iterable of CESR frames
 */
export async function* read(input: AsyncIterable<Uint8Array>): AsyncIterableIterator<Frame> {
  const parser = new Parser();

  for await (const chunk of input) {
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

/**
 * Parses JSON messages with CESR attachments from an incoming stream of bytes.
 *
 * @param input Incoming stream of bytes
 * @returns An async iterable of messages with attachments
 */
export async function* parse(input: ParserInput): AsyncIterableIterator<Message> {
  const stream = resolveInput(input);

  let payload: MessagePayload | null = null;
  let group: string | null = null;
  let attachments: Record<string, string[]> = {};

  for await (const frame of read(stream)) {
    if (frame.type === "json") {
      if (payload) {
        yield { payload, attachments };
      }

      payload = JSON.parse(frame.text);
      attachments = {};
      group = null;
    } else if (frame.type === "counter_10") {
      group = frame.code;
    } else if (group) {
      attachments[group] = [...(attachments[group] ?? []), frame.text];
    }
  }

  if (payload || Object.keys(attachments).length > 0) {
    yield { payload: payload ?? {}, attachments: attachments ?? [] };
  }
}

export type MessagePayload = DataObject;

export interface Message {
  payload: MessagePayload;
  attachments: Record<string, string[]>;
}
