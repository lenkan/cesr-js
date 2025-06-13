import { CountCode_10 } from "./codes.ts";
import type { MessageVersion, ParsingContext } from "./encoding.ts";
import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";
import { encoding } from "./encoding.ts";

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

  constructor(options: ParserOptions = {}) {
    this.#buffer = new Uint8Array(0);
    this.#version = options.version ?? 1;
  }

  #readJSON(): Frame | null {
    if (this.#buffer.length < 25) {
      return null;
    }

    const version = encoding.decodeVersionString(this.#buffer.slice(0, 24));
    if (this.#buffer.length < version.size) {
      return null;
    }

    const frame = this.#buffer.slice(0, version.size);
    this.#buffer = this.#buffer.slice(version.size);

    return {
      type: "message",
      version: version,
      text: decodeUtf8(frame),
    };
  }

  #read(): Frame | null {
    const start = this.#buffer[0] >> 5;

    switch (start) {
      case 0b011:
        return this.#readJSON();
    }

    const context = this.#stack[this.#stack.length - 1] ?? undefined;
    const result = encoding.decodeStream(this.#buffer, context);
    this.#buffer = this.#buffer.slice(result.n);

    if (!result.frame) {
      return null;
    }

    for (const ctx of this.#stack) {
      ctx.quadlets += result.n / 4;
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

    if (result.frame.code.startsWith("-")) {
      if (result.frame.code === CountCode_10.KERIACDCGenusVersion) {
        const genus = encoding.decodeGenus(result.frame.text);
        this.#version = genus.major;
      } else {
        this.#stack.push({
          code: result.frame.code,
          version: this.#version,
          count: result.frame.count ?? 0,
          quadlets: 0,
          frames: 0,
        });
      }
    }

    return {
      type: "cesr",
      code: result.frame.code,
      text: result.frame.text,
      count: result.frame.count,
      raw: result.frame.raw,
    };
  }

  *parse(source: Uint8Array): IterableIterator<Frame> {
    this.#buffer = concat(this.#buffer, source);

    while (this.#buffer.length > 0) {
      const frame = this.#read();

      if (!frame) {
        return null;
      }

      yield frame;
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
