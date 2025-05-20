import type { DataObject } from "./data-type.ts";
import type { ParserOptions } from "./parser.ts";
import { parse, type ParserInput } from "./parser.ts";
import { Message } from "./version.ts";

/**
 * Parses JSON messages with CESR attachments from an incoming stream of bytes.
 *
 * @param input Incoming stream of bytes
 * @returns An async iterable of messages with attachments
 */
export async function* parseMessages(input: ParserInput, options: ParserOptions = {}): AsyncIterableIterator<Envelope> {
  let group: string | null = null;
  let message: Envelope | null = null;

  for await (const frame of parse(input, options)) {
    if (frame instanceof Message) {
      if (message) {
        yield message;
      }

      message = { payload: JSON.parse(frame.text), attachments: {} };
      group = null;
    } else {
      if (frame.code.startsWith("-")) {
        group = frame.code;
      } else {
        message = message ?? { payload: {}, attachments: {} };

        if (group) {
          message.attachments[group] = [...(message.attachments[group] ?? []), frame.text];
        }
      }
    }
  }

  if (message) {
    yield message;
  }
}

export interface Envelope {
  payload: DataObject;
  attachments: Record<string, string[]>;
}
