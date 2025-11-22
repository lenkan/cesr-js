import { Attachments, type AttachmentsInit } from "./attachments.ts";
import { MessageBody, type MessageBodyInit } from "./message-body.ts";
import type { VersionString } from "./version-string.ts";

const customInspectSymbol = Symbol.for("nodejs.util.inspect.custom");

export class Message<T extends Record<string, unknown> = Record<string, unknown>> {
  #attachments: Attachments;
  readonly #body: MessageBody<T>;

  constructor(body: MessageBodyInit<T>, attachments?: AttachmentsInit) {
    this.#body = new MessageBody(body);
    this.#attachments = new Attachments(attachments ?? {});
  }

  get payload(): T {
    return this.#body.payload;
  }

  get version(): VersionString {
    return this.#body.version;
  }

  get protocol(): string {
    return this.#body.version.protocol;
  }

  get body(): MessageBody<T> {
    return this.#body;
  }

  get attachments(): Attachments {
    return this.#attachments;
  }

  set attachments(value: AttachmentsInit) {
    this.#attachments = new Attachments(value);
  }

  encode(): string {
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
