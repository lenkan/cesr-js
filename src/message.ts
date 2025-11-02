import { Attachments, type AttachmentsInit } from "./attachments.ts";
import { MessageBody, type MessageBodyInit } from "./message-body.ts";

const customInspectSymbol = Symbol.for("nodejs.util.inspect.custom");

export class Message<T extends Record<string, unknown> = Record<string, unknown>> {
  #attachments: Attachments;
  readonly #body: MessageBody<T>;

  constructor(body: MessageBodyInit<T> | MessageBody<T>, attachments?: Attachments | AttachmentsInit) {
    this.#body = body instanceof MessageBody ? body : new MessageBody(body);
    this.#attachments = new Attachments(attachments ?? {});
  }

  get body(): MessageBody<T> {
    return this.#body;
  }

  get attachments(): Attachments {
    return this.#attachments;
  }

  set attachments(value: Attachments | AttachmentsInit) {
    this.#attachments = new Attachments(value);
  }

  toString(): string {
    return this.#body.text + this.#attachments.toString();
  }

  /**
   * Custom inspect function for pretty printing in Node.js console.
   * Example: console.log(message) will show this formatted output.
   * Also works in browsers with a simpler format.
   */
  [customInspectSymbol](depth: number): string {
    const payload = this.body.payload;

    if (depth < 0) {
      return "[Message]";
    }

    // Simple pretty print that works in both Node.js and browsers
    const payloadStr = JSON.stringify(payload, null, 2).replace(/\n/g, "\n  ");

    return [
      "Message {",
      `  payload: ${payloadStr},`,
      `  attachments:`,
      `    sigs: [${this.#attachments.ControllerIdxSigs.join(", ")}],`,
      `    receipts: [${this.#attachments.NonTransReceiptCouples}],`,
      "}",
    ].join("\n");
  }

  readonly [Symbol.toStringTag] = "Message";
}
