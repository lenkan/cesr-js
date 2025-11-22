import { concat } from "./array-utils.ts";
import { AttachmentsReader } from "./attachments-reader.ts";
import { type Attachments } from "./attachments.ts";
import { CountCode_10, CountCode_20 } from "./codes.ts";
import { encodeUtf8 } from "./encoding-utf8.ts";
import { decodeGenus, readCounter } from "./encoding.ts";
import { MessageBody } from "./message-body.ts";
import { Message } from "./message.ts";

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
 * @returns An async iterable of {@link Message} objects
 */
export async function* parse(input: ParseInput, options?: ParseOptions): AsyncIterableIterator<Message> {
  let body: MessageBody | null = null;
  let attachments: Attachments | null = null;
  let buffer: Uint8Array = new Uint8Array(0);

  // The version of the spec to use for group parsing
  let version: number = options?.version ?? 1;

  for await (const chunk of resolveInput(input)) {
    buffer = concat(buffer, chunk);

    while (buffer.length > 0) {
      if (buffer.length < 4) {
        break;
      }

      const start = String.fromCharCode(buffer[0]);

      if (start === "{") {
        if (body) {
          yield new Message(body.payload, attachments ?? undefined);
          body = null;
          attachments = null;
        }

        body = MessageBody.parse(buffer);

        if (!body) {
          break;
        }

        if (body.version.legacy === false) {
          // Update version for group parsing if the JSON body
          // is encoded using the new Version String format
          version = 2;
        }

        buffer = buffer.slice(body.raw.length);
      } else if (start === "-") {
        const counter = readCounter(buffer);

        if (!counter.frame) {
          break;
        }

        if (counter.frame.code.startsWith("-_")) {
          version = decodeGenus(counter.frame.text).major;
          buffer = buffer.slice(counter.n);
        } else if (
          (version === 1 && counter.frame.code === CountCode_10.AttachmentGroup) ||
          (version === 2 && counter.frame.code === CountCode_20.AttachmentGroup)
        ) {
          if (buffer.length < counter.n + counter.frame.count * 4) {
            // Not enough data to read the whole attachment group
            break;
          }

          const reader = new AttachmentsReader(buffer, { version });
          attachments = reader.readAttachments();

          if (!attachments) {
            break;
          }

          buffer = buffer.slice(reader.bytesRead);
        } else {
          const reader = new AttachmentsReader(buffer, { version });
          attachments = reader.readAttachments();

          if (!attachments) {
            break;
          }

          buffer = buffer.slice(reader.bytesRead);
        }
      } else {
        throw new Error(`Unexpected start byte: ${start}`);
      }
    }
  }

  if (body) {
    yield new Message(body.payload, attachments ?? undefined);
  }

  if (buffer.length > 0) {
    throw new Error("Unexpected end of stream");
  }
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
