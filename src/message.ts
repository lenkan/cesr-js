import { CounterV1, CounterV2 } from "./counter.ts";
import type { DataObject } from "./data-type.ts";
import { parse, type ParserInput } from "./parser.ts";
import { Message } from "./version.ts";

/**
 * Parses JSON messages with CESR attachments from an incoming stream of bytes.
 *
 * @param input Incoming stream of bytes
 * @returns An async iterable of messages with attachments
 */
export async function* parseMessages(input: ParserInput): AsyncIterableIterator<Envelope> {
  let group: string | null = null;
  let message: Envelope | null = null;

  for await (const frame of parse(input)) {
    if (frame instanceof Message) {
      if (message) {
        yield message;
      }

      message = { payload: JSON.parse(frame.text), attachments: {} };
      group = null;
    } else {
      if (frame instanceof CounterV1 || frame instanceof CounterV2) {
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
