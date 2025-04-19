import type { DataObject } from "./data-type.ts";
import { parse, type ParserInput } from "./parser.ts";

/**
 * Parses JSON messages with CESR attachments from an incoming stream of bytes.
 *
 * @param input Incoming stream of bytes
 * @returns An async iterable of messages with attachments
 */
export async function* parseMessages(input: ParserInput): AsyncIterableIterator<Message> {
  let payload: MessagePayload | null = null;
  let group: string | null = null;
  let attachments: Record<string, string[]> = {};

  for await (const frame of parse(input)) {
    if (frame.type === "json") {
      if (payload) {
        yield { payload, attachments };
      }

      payload = JSON.parse(frame.text);
      attachments = {};
      group = null;
    } else if (frame.type === "counter_10") {
      group = frame.code;
    } else if (group) {
      attachments[group] = [...(attachments[group] ?? []), frame.text];
    }
  }

  if (payload || Object.keys(attachments).length > 0) {
    yield { payload: payload ?? {}, attachments: attachments ?? [] };
  }
}

export type MessagePayload = DataObject;

export interface Message {
  payload: MessagePayload;
  attachments: Record<string, string[]>;
}
