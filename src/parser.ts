import { CountCode_10, CountCode_20, IndexTable, MatterTable } from "./codes.ts";
import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";
import { decodeGenus, decodeVersionString, type Genus } from "./encoding.ts";
import { concat } from "./array-utils.ts";
import { CodeTable, type ReadResult } from "./code-table.ts";

export interface CesrFrame {
  type: "cesr";
  code: string;
  text: string;
  raw: Uint8Array;
}

export interface MessageFrame {
  type: "message";

  /**
   * The serialization kind
   */
  code: string;
  text: string;
  raw: Uint8Array;
}

export type Frame = CesrFrame | MessageFrame;

export interface ParserOptions {
  version?: number;
}

interface ParsingContext {
  code: string;
  count: number;
  n: number;
  frames: number;
}

function isContextFinished(version: number, context: ParsingContext): boolean {
  if (version === 1) {
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
        return context.n === context.count;
      case CountCode_10.PathedMaterialCouples:
      case CountCode_10.BigPathedMaterialCouples:
        return context.n === context.count;
      default:
        throw new Error(`Cannot determine if group ${context.code} is finished`);
    }
  }

  return context.n === context.count;
}

class Parser {
  #buffer: Uint8Array;
  #stack: ParsingContext[] = [];
  #genus: Genus;
  #matter: CodeTable;
  #indexer: CodeTable;

  constructor(options: ParserOptions = {}) {
    this.#buffer = new Uint8Array(0);
    this.#matter = new CodeTable(MatterTable);
    this.#indexer = new CodeTable(IndexTable, { strict: true });
    this.#genus = {
      genus: "AAA",
      major: options.version ?? 1,
      minor: 0,
    };
  }

  #readJSON(input: Uint8Array): ReadResult {
    if (input.length < 25) {
      return { frame: null, n: 0 };
    }

    const version = decodeVersionString(input.slice(0, 24));
    if (input.length < version.size) {
      return { frame: null, n: 0 };
    }

    const frame = input.slice(0, version.size);

    return {
      frame: {
        code: "JSON",
        count: 0,
        index: 0,
        ondex: 0,
        text: decodeUtf8(frame),
        raw: frame,
      },
      n: version.size,
    };
  }

  #readCesr(input: Uint8Array, context?: ParsingContext): ReadResult {
    if (!context) {
      return this.#matter.read(input);
    }

    switch (this.#genus.genus) {
      case "AAA":
        switch (this.#genus.major) {
          case 1:
            switch (context.code) {
              case CountCode_10.ControllerIdxSigs:
              case CountCode_10.WitnessIdxSigs:
                return this.#indexer.read(input);
              default:
                return this.#matter.read(input);
            }
          default: {
            switch (context.code) {
              case CountCode_20.WitnessIdxSigs:
              case CountCode_20.BigWitnessIdxSigs:
              case CountCode_20.TransIdxSigGroups:
              case CountCode_20.BigTransIdxSigGroups:
              case CountCode_20.TransLastIdxSigGroups:
              case CountCode_20.BigTransLastIdxSigGroups:
              case CountCode_20.BigControllerIdxSigs:
              case CountCode_20.ControllerIdxSigs:
                return this.#indexer.read(input);
              default:
                return this.#matter.read(input);
            }
          }
        }
      default:
        return this.#matter.read(input);
    }
  }

  #processReadResult(result: ReadResult) {
    if (!result.frame) {
      return;
    }

    this.#buffer = this.#buffer.slice(result.n);

    for (const group of this.#stack) {
      group.n += result.n / 4;
      group.frames += 1;
    }

    while (this.#stack.length > 0) {
      const ctx = this.#stack[this.#stack.length - 1];

      if (isContextFinished(this.#genus.major, ctx)) {
        this.#stack.pop();
      } else {
        break;
      }
    }

    if (result.frame.code.startsWith("-_")) {
      const genus = decodeGenus(result.frame.text);
      this.#genus = genus;
    } else if (result.frame.code.startsWith("-")) {
      this.#stack.push({
        code: result.frame.code,
        count: result.frame.count,
        frames: 0,
        n: 0,
      });
    }
  }

  #read(input: Uint8Array): ReadResult {
    if (this.#stack.length === 0) {
      const start = input[0] >> 5;

      switch (start) {
        case 0b000:
          throw new Error(`Unsupported cold start byte ${input[0]}, annotated streams not implemented`);
        case 0b001:
          return this.#readCesr(input);
        case 0b010:
          throw new Error(`Unsupported cold start byte ${this.#buffer[0]}, op codes not implemented`);
        case 0b011:
          return this.#readJSON(input);
        case 0b101:
          throw new Error(`Unsupported cold start byte ${this.#buffer[0]}, CBOR decoding not implemented`);
        case 0b100:
        case 0b110:
          throw new Error(`Unsupported cold start byte ${this.#buffer[0]}, MGPK decoding not implemented`);
        case 0b111:
          throw new Error(`Unsupported cold start byte ${this.#buffer[0]}, binary domain decoding not implemented`);
        default:
          throw new Error(`Unsupported cold start byte ${this.#buffer[0]}`);
      }
    }

    return this.#readCesr(this.#buffer, this.#stack[this.#stack.length - 1]);
  }

  *parse(source: Uint8Array): IterableIterator<Frame> {
    this.#buffer = concat(this.#buffer, source);

    while (this.#buffer.length > 0) {
      const result = this.#read(this.#buffer);

      if (!result.frame) {
        return null;
      }

      this.#processReadResult(result);

      if (result.frame.code === "JSON") {
        yield {
          type: "message",
          code: "JSON",
          text: result.frame.text,
          raw: result.frame.raw,
        };
      } else {
        yield {
          type: "cesr",
          code: result.frame.code,
          text: result.frame.text,
          raw: result.frame.raw,
        };
      }
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
export async function* parse(input: ParserInput, options?: ParserOptions): AsyncIterableIterator<Frame> {
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
