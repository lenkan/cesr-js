import type { DataObject } from "./data-type.ts";
import { parse, type ParserInput } from "./parser.ts";

/**
 * Parses JSON messages with CESR attachments from an incoming stream of bytes.
 *
 * @param input Incoming stream of bytes
 * @returns An async iterable of messages with attachments
 */
export async function* parseMessages(input: ParserInput): AsyncIterableIterator<Message> {
  let group: string | null = null;
  let message: Message | null = null;

  for await (const frame of parse(input)) {
    switch (frame.type) {
      case "message": {
        if (message) {
          yield message;
        }

        message = { payload: JSON.parse(frame.text), attachments: {} };
        group = null;
        break;
      }
      case "counter_10":
      case "counter_20":
        group = frame.code;
        break;
      default: {
        message = message ?? { payload: {}, attachments: {} };
        if (group) {
          message.attachments[group] = [...(message.attachments[group] ?? []), frame.text];
        }
        break;
      }
    }
  }

  if (message) {
    yield message;
  }
}

export type MessagePayload = DataObject;

export interface Message {
  payload: MessagePayload;
  attachments: Record<string, string[]>;
}
