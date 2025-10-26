import { CountCode_10, CountCode_20, IndexTable, MatterTable } from "./codes.ts";
import { decodeUtf8 } from "./encoding-utf8.ts";
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
  /**
   * CESR version to use for cold start parsing. Defaults to 1.
   */
  version?: number;

  /**
   * Enable streaming mode. In streaming mode, the parser will not throw errors
   * for incomplete groups until the `complete` method is called.
   */
  stream?: boolean;
}

/**
 * Context information for a group being parsed
 */
export interface ParserContext {
  /**
   * The group code
   */
  readonly code: string;

  /**
   * The expected count of items in the group.
   *
   * For CESR v2, this is always the number of bytes expected in the group.
   *
   * For CESR v1, this can be either number of items in the group, or number of bytes,
   * depending on the group code.
   */
  readonly count: number;

  /**
   * The number of frames parsed in the group so far.
   */
  frames: number;

  /**
   * The number of bytes parsed in the group so far.
   */
  n: number;
}

function isContextFinished(version: number, context: ParserContext): boolean {
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

export class IncompleteGroupParserError extends Error {
  context: ParserContext;

  constructor(context: ParserContext) {
    super(`Incomplete group context: ${JSON.stringify(context)}`);
    this.name = "IncompleteGroupParserError";
    this.context = { ...context };
  }
}

/**
 * A CESR (Composable Event Streaming Representation) parser that processes byte streams
 * and extracts structured frames.
 *
 * The Parser class maintains internal state to handle streaming data, buffering incomplete
 * frames and tracking parsing contexts for nested group structures. It supports both
 * streaming and non-streaming modes, and can handle different CESR versions.
 *
 * @example
 * Basic usage:
 * ```ts
 * const parser = new Parser({ version: 1 });
 * const data = new Uint8Array(cesrEncodedBytes);
 *
 * for (const frame of parser.parse(data)) {
 *   console.log('Frame type:', frame.type, 'code:', frame.code);
 * }
 *
 * parser.complete(); // Ensure all groups are properly closed
 * ```
 */
export class Parser {
  #buffer: Uint8Array;
  #stack: ParserContext[] = [];
  #genus: Genus;
  #matter: CodeTable;
  #indexer: CodeTable;
  #stream: boolean;
  #counter: CodeTable;

  constructor(options: ParserOptions = {}) {
    this.#buffer = new Uint8Array(0);
    this.#matter = new CodeTable(MatterTable);
    this.#counter = new CodeTable({}, { strict: false });
    this.#indexer = new CodeTable(IndexTable, { strict: true });
    this.#stream = options.stream ?? false;
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

  #readGroup(input: Uint8Array): ReadResult {
    return this.#counter.read(input);
  }

  #readCesr(input: Uint8Array, context: ParserContext): ReadResult {
    switch (this.#genus.genus) {
      case "AAA":
        switch (this.#genus.major) {
          case 1:
            switch (context.code) {
              case CountCode_10.ControllerIdxSigs:
              case CountCode_10.WitnessIdxSigs: {
                if (input[0] === 45) {
                  this.complete();
                }

                return this.#indexer.read(input);
              }
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
              case CountCode_20.ControllerIdxSigs: {
                if (input[0] === 45) {
                  this.complete();
                }

                return this.#indexer.read(input);
              }
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
    const context = this.#stack[this.#stack.length - 1];

    if (!context) {
      const start = input[0];

      switch (start) {
        case 35: // "#"
          throw new Error(`Unsupported cold start byte ${start}, annotated streams not implemented`);
        case 45: // "-"
          return this.#readGroup(input);
        case 95: // "_"
          throw new Error(`Unsupported cold start byte ${start}, op codes not implemented`);
        case 123: // "{"
          return this.#readJSON(input);
      }

      const tritet = input[0] >> 5;
      switch (tritet) {
        case 0b101:
          throw new Error(`Unsupported cold start byte ${start}, CBOR decoding not implemented`);
        case 0b100:
        case 0b110:
          throw new Error(`Unsupported cold start byte ${start}, MGPK decoding not implemented`);
        case 0b111:
          throw new Error(`Unsupported cold start byte ${start}, binary domain decoding not implemented`);
        default:
          throw new Error(`Unsupported cold start byte ${start}, stream must start with a message, group or op code`);
      }
    }

    return this.#readCesr(input, context);
  }

  /**
   * Parses CESR frames from a Uint8Array source.
   *
   * This method processes the input bytes and yields parsed frames as they become available.
   * The input is buffered internally, allowing for incremental parsing of streaming data.
   *
   * @param source - The Uint8Array containing CESR-encoded data to parse
   * @returns An iterable iterator that yields Frame objects (either CesrFrame or MessageFrame)
   */
  *parse(source: Uint8Array): IterableIterator<Frame> {
    if (!(source instanceof Uint8Array)) {
      throw new Error(`Parser.parse expected Uint8Array, got ${typeof source}`);
    }

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

    if (this.#stream === false) {
      this.complete();
    }
  }

  /**
   * Complete the parsing process, throwing if there is any incomplete group or unexpected data.
   *
   * @example
   *
   * ```ts
   * import { Parser } from "cesr";
   *
   * const parser = new Parser();
   * const data = ...; // some Uint8Array data containing CESR frames
   *
   * for (const frame of parser.parse(data)) {
   *   console.log(frame);
   * }
   *
   * // Ensure that group parsing is complete
   * parser.complete();
   * ```
   */
  complete(): void {
    const context = this.#stack[this.#stack.length - 1];

    if (context) {
      throw new IncompleteGroupParserError(context);
    }

    if (this.#buffer.length > 0) {
      throw new Error("Unexpected end of stream");
    }
  }
}
