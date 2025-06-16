import { CountCode_10 } from "./codes.ts";
import type { CodeSize, MessageVersion, ParsingContext } from "./encoding.ts";
import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";
import { encoding, findCodeSize, findFullSize, findHardSize } from "./encoding.ts";

export type Frame =
  | {
      type: "cesr";
      code: string;
      text: string;
      count?: number;
      index?: number;
      ondex?: number;
      raw: Uint8Array;
    }
  | {
      type: "message";
      version: MessageVersion;
      text: string;
    };

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

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

interface GroupContext extends ParsingContext {
  /**
   * The version of the CESR encoding
   */
  version: number;

  /**
   * The expected count of the group
   */
  count: number;

  /**
   * How many bytes have been consumed in this group
   */
  quadlets: number;

  /**
   * How many frames have been decoded
   */
  frames: number;
}

function isContextComplete(context: GroupContext): boolean {
  if (context.version === 1) {
    switch (context.code) {
      case CountCode_10.ControllerIdxSigs:
      case CountCode_10.WitnessIdxSigs:
        return context.frames === context.count;
      case CountCode_10.SealSourceCouples:
      case CountCode_10.FirstSeenReplayCouples:
      case CountCode_10.NonTransReceiptCouples:
        return context.frames === context.count * 2;
      case CountCode_10.SealSourceTriples:
        return context.frames === context.count * 3;
      case CountCode_10.TransReceiptQuadruples:
        return context.frames === context.count * 4;
      case CountCode_10.TransIdxSigGroups:
        // |pre|snu|dig|group of controller sigs
        // So, we assume that this group is finished for simplicity, higher level code
        // needs to verify the signatures anyway
        return context.frames === context.count * 3;
      case CountCode_10.TransLastIdxSigGroups:
        // |pre|group of controller sigs
        // So, we assume that this group is finished for simplicity, higher level code
        // needs to verify the signatures anyway
        return context.frames === context.count;
      case CountCode_10.AttachmentGroup:
      case CountCode_10.BigAttachmentGroup:
        return context.quadlets === context.count;
      default:
        throw new Error(`Cannot determine if group ${context.code} is finished`);
    }
  }

  return context.quadlets === context.count;
}

export interface ParserOptions {
  version?: number;
}

class Parser {
  #buffer: Uint8Array;
  #stack: GroupContext[] = [];
  #version: number;
  #reader: ReadableStreamDefaultReader;

  constructor(input: ParserInput, options: ParserOptions = {}) {
    this.#buffer = new Uint8Array(0);
    this.#version = options.version ?? 1;
    this.#reader = resolveInput(input);
  }

  async #peekBytes(numBytes: number): Promise<Uint8Array> {
    while (this.#buffer.length < numBytes) {
      const result = await this.#reader.read();

      if (result.done) {
        break;
      }

      this.#buffer = concat(this.#buffer, result.value);
    }

    if (this.#buffer.length < numBytes) {
      throw new Error(`Not enough bytes in buffer, expected ${numBytes}, got ${this.#buffer.length}`);
    }

    return this.#buffer.slice(0, numBytes);
  }

  async #readBytes(numBytes: number): Promise<Uint8Array> {
    const result = await this.#peekBytes(numBytes);
    this.#buffer = this.#buffer.slice(result.length);
    return result;
  }

  async #readJSON(): Promise<Frame> {
    const version = encoding.decodeVersionString(decodeUtf8(await this.#peekBytes(25)));
    const frame = await this.#readBytes(version.size);

    return {
      type: "message",
      version: version,
      text: decodeUtf8(frame),
    };
  }

  async *#readCounter(start: string): AsyncIterableIterator<Frame> {
    const selector = start.charAt(1);
    let size: CodeSize | null = null;

    if (ALPHABET.includes(selector)) {
      size = { hs: 2, ss: 2, fs: 4 };
    } else if (selector === "-") {
      size = { hs: 3, ss: 4, fs: 8 };
    } else if (selector === "_") {
      size = { hs: 5, ss: 3, fs: 8 };
    } else {
      throw new Error(`Invalid first character in input ${start}`);
    }

    const frame = encoding.decode(await this.#readBytes(size.fs), { code: "", version: this.#version });
    yield {
      type: "cesr",
      code: frame.code,
      raw: frame.raw,
      text: frame.text,
      count: frame.count,
      index: frame.index,
      ondex: frame.ondex,
    };
  }

  async *parse(): AsyncIterableIterator<Frame> {
    while (true) {
      if (this.#buffer.length === 0) {
        const result = await this.#reader.read();

        if (result.done) {
          return;
        }

        if (result.value) {
          this.#buffer = concat(this.#buffer, result.value);
        }
      }

      // All frames are at least 4 bytes
      const start = decodeUtf8(await this.#peekBytes(4));
      const context = this.#stack[this.#stack.length - 1] ?? undefined;

      switch (start.charAt(0)) {
        case "{":
          yield await this.#readJSON();
          break;
        case "-":
          yield* this.#readCounter();
          break;
      }

      const hs = findHardSize(await this.#peekBytes(2), context);
      const hard = decodeUtf8(await this.#peekBytes(hs));
      const codeSize = findCodeSize(hard, context);
      const cs = codeSize.hs + codeSize.ss;
      const fs = findFullSize(await this.#peekBytes(cs), codeSize);

      const frame = encoding.decode(await this.#readBytes(fs), context);

      for (const ctx of this.#stack) {
        ctx.quadlets += fs / 4;
        ctx.frames += 1;
      }

      while (this.#stack.length > 0) {
        const ctx = this.#stack[this.#stack.length - 1];
        if (isContextComplete(ctx)) {
          this.#stack.pop();
        } else {
          break;
        }
      }

      if (frame.code.startsWith("-")) {
        if (frame.code === CountCode_10.KERIACDCGenusVersion) {
          const genus = encoding.decodeGenus(frame.text);
          this.#version = genus.major;
        } else {
          this.#stack.push({
            code: frame.code,
            version: this.#version,
            count: frame.count ?? 0,
            quadlets: 0,
            frames: 0,
          });
        }
      }

      return {
        type: "cesr",
        code: frame.code,
        text: frame.text,
        count: frame.count,
        raw: frame.raw,
      };
    }
  }

  get finished() {
    return this.#buffer.length === 0 && this.#stack.length === 0;
  }
}

/**
 * Parses CESR frames from an incoming stream of bytes.
 *
 * @param input Incoming stream of bytes
 * @returns An async iterable of CESR frames
 */
export async function* parse(input: ParserInput, options: ParserOptions): AsyncIterableIterator<Frame> {
  const parser = new Parser(input, options);

  for await (const frame of parser.parse()) {
    yield frame;
  }

  if (!parser.finished) {
    throw new Error("Unexpected end of stream");
  }
}

export type ParserInput = Uint8Array | string | AsyncIterable<Uint8Array>;

function resolveInput(input: ParserInput): ReadableStreamDefaultReader<Uint8Array> {
  if (typeof input === "string") {
    return ReadableStream.from([encodeUtf8(input)]).getReader();
  }

  if (input instanceof Uint8Array) {
    return ReadableStream.from([input]).getReader();
  }

  return ReadableStream.from(input).getReader();
}
