import { parseVersion } from "./version.ts";
import type { CodeSize } from "./codes.ts";
import { MatterSize, IndexerSize, CountCode_10, CounterSize_10 } from "./codes.ts";
import type { DataObject } from "./data-type.ts";
import { decodeBase64Int } from "./base64.ts";

export type FrameType = "json" | "indexer" | "matter" | "counter_10" | "counter_20";

export interface Frame {
  type: FrameType;
  code: string;
  text: string;
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

// function prepad(raw: Uint8Array, length: number): Uint8Array {
//   if (raw.byteLength === length) {
//     return raw;
//   }

//   if (raw.byteLength > length) {
//     throw new Error("Cannot pad, input is longer than desired length");
//   }

//   const padded = new Uint8Array(length + raw.byteLength);
//   padded.set(raw, length);
//   return padded;
// }

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
      text: this.#decoder.decode(frame),
    };
  }

  #readCode(table: Record<string, CodeSize>): CodeSize | null {
    let code = "";
    let size: CodeSize | null = null;

    while (!size) {
      if (this.#buffer.length < code.length + 1) {
        return null;
      }

      if (code.length >= 4) {
        throw new Error("Expected frame");
      }

      code = this.#decoder.decode(this.#buffer.slice(0, code.length + 1));
      size = table[code];
    }

    return size;
  }

  #readFrame(table: Record<string, CodeSize>): Frame | null {
    const code = this.#readCode(table);

    if (!code) {
      return null;
    }

    if (code.fs) {
      if (this.#buffer.length < code.fs) {
        return null;
      }

      const frame = this.#buffer.slice(0, code.fs);
      const qb64 = this.#decoder.decode(frame);

      if (code.type === "counter_10") {
        const count = decodeBase64Int(qb64.slice(code.hs, code.hs + code.ss));
        switch (code.prefix) {
          case CountCode_10.ControllerIdxSigs:
          case CountCode_10.WitnessIdxSigs:
            this.#group = { code: code.prefix, table: IndexerSize, count };
            break;
          case CountCode_10.NonTransReceiptCouples:
          case CountCode_10.SealSourceCouples:
          case CountCode_10.FirstSeenReplayCouples:
            this.#group = { code: code.prefix, table: MatterSize, count: count * 2 };
            break;
        }
      }

      this.#buffer = this.#buffer.slice(frame.length);

      return {
        type: code.type as FrameType,
        code: code.prefix,
        text: qb64,
      };
    }

    throw new Error("No variable size yet");
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
