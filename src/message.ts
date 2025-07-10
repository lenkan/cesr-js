import type { ParserOptions } from "./parser.ts";
import { parse, type ParserInput } from "./parser.ts";

/**
 * Parses JSON messages with CESR attachments from an incoming stream of bytes.
 *
 * @param input Incoming stream of bytes
 * @returns An async iterable of messages with attachments
 */
export async function* parseMessages(input: ParserInput, options: ParserOptions = {}): AsyncIterableIterator<Message> {
  let message: Message | null = null;

  for await (const frame of parse(input, options)) {
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

  if (message) {
    yield message;
  }
}

export interface Message {
  payload: Record<string, unknown>;
  attachments: string[];
}
