import { encodeUtf8 } from "./encoding-utf8.ts";
import { Parser } from "./parser.ts";

export type ParseInput = Uint8Array | string | AsyncIterable<Uint8Array>;

export interface ParseOptions {
  /**
   * CESR version to use for cold start parsing. Defaults to 1.
   */
  version?: number;
}

/**
 * Parses CESR messages from an incoming stream of bytes.
 *
 * See also {@link Parser} for lower level parsing capabilities.
 *
 * @example
 *
 * ```ts
 * import { parse } from "cesr";
 *
 * const url = "https://example.com/oobi/EAQABAA..."; // URL returning a CESR stream
 * const response = await fetch(url);
 *
 * if (response.body) {
 *   for await (const message of parse(response.body)) {
 *     console.log(message);
 *   }
 * }
 * ```
 *
 * @param input
 * Input to the parser. Can be an Uint8Array, string or stream.
 *
 * Strings are treated as UTF-8 encoded data.
 *
 * @param options
 * Parser options
 *
 * @returns An async iterable of CESR frames
 */
export async function* parse(input: ParseInput, options?: ParseOptions): AsyncIterableIterator<Message> {
  const parser = new Parser({
    version: options?.version,
    stream: true,
  });

  let message: Message | null = null;

  for await (const chunk of resolveInput(input)) {
    for (const frame of parser.parse(chunk)) {
      if (frame.type === "message") {
        if (message) {
          yield message;
        }
        message = { payload: JSON.parse(frame.text), attachments: [] };
      } else {
        message = message ?? { payload: {}, attachments: [] };
        message.attachments.push(frame.text);
      }
    }
  }

  if (message) {
    yield message;
  }

  parser.complete();
}

function resolveInput(input: ParseInput): AsyncIterable<Uint8Array> {
  if (typeof input === "string") {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encodeUtf8(input));
        controller.close();
      },
    });
  }

  if (input instanceof Uint8Array) {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(input);
        controller.close();
      },
    });
  }

  return input;
}

/**
 * Parsed CESR message with attachments
 */
export interface Message {
  /**
   * Message payload
   */
  readonly payload: Record<string, unknown>;

  /**
   * CESR attachments in text domain
   */
  readonly attachments: string[];
}
