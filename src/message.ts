import { Attachments, type AttachmentsInit } from "./attachments.ts";
import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";
import { VersionString } from "./version-string.ts";

const customInspectSymbol = Symbol.for("nodejs.util.inspect.custom");

export interface MessageBody {
  v: string;
  [key: string]: unknown;
}

function encode(init: MessageBody): Uint8Array {
  const { v, ...payload } = init;

  if (typeof v !== "string") {
    throw new Error(`Version field 'v' in payload must be a string, got ${typeof v}`);
  }

  const tmpversion = VersionString.parse(v);

  const tmp = encodeUtf8(
    JSON.stringify({
      v: tmpversion.text,
      ...payload,
    }),
  );

  const version = new VersionString({
    protocol: tmpversion.protocol,
    major: tmpversion.major,
    minor: tmpversion.minor,
    kind: tmpversion.kind,
    legacy: tmpversion.legacy,
    size: tmp.length,
  });

  const raw = encodeUtf8(
    JSON.stringify({
      v: version.text,
      ...payload,
    }),
  );

  return raw;
}

function read(input: Uint8Array): MessageBody | null {
  if (input.length === 0) {
    return null;
  }

  if (input[0] !== 0x7b) {
    const preview = decodeUtf8(input.slice(0, 20));
    throw new Error(`Expected JSON starting with '{' (0x7b), got: "${preview}"`);
  }

  if (input.length < 25) {
    return null;
  }

  const version = VersionString.extract(input.slice(0, 24));
  if (input.length < version.size) {
    return null;
  }

  const frame = input.slice(0, version.size);

  return JSON.parse(decodeUtf8(frame));
}

export class Message<T extends MessageBody = MessageBody> {
  #attachments: Attachments;
  readonly #raw: Uint8Array;

  constructor(body: T, attachments?: AttachmentsInit) {
    this.#raw = encode(body);
    this.#attachments = new Attachments(attachments ?? {});
  }

  text(): string {
    return decodeUtf8(this.#raw);
  }

  get raw(): Uint8Array {
    return this.#raw;
  }

  get version(): VersionString {
    if (!this.body.v || typeof this.body.v !== "string") {
      throw new Error("Payload does not contain a valid version string 'v'");
    }

    return VersionString.parse(this.body.v);
  }

  get body(): T {
    return JSON.parse(this.text());
  }

  get attachments(): Attachments {
    return this.#attachments;
  }

  set attachments(value: AttachmentsInit) {
    this.#attachments = new Attachments(value);
  }

  /**
   * Custom inspect function for pretty printing in Node.js console.
   * Example: console.log(message) will show this formatted output.
   * Also works in browsers with a simpler format.
   */
  [customInspectSymbol](depth: number): string {
    if (depth < 0) {
      return "[Message]";
    }

    // Simple pretty print that works in both Node.js and browsers
    const payloadStr = JSON.stringify(this.body, null, 2).replace(/\n/g, "\n  ");

    return [
      "Message {",
      `  payload: ${payloadStr},`,
      `  attachments:`,
      `    sigs: [${this.#attachments.ControllerIdxSigs.join(", ")}],`,
      `    receipts: [${this.#attachments.NonTransReceiptCouples}],`,
      "}",
    ].join("\n");
  }

  static parse(input: Uint8Array): Message | null {
    const body = read(input);

    if (body === null) {
      return null;
    }

    return new Message(body);
  }

  static encode(init: MessageBody): Uint8Array {
    return encode(init);
  }

  readonly [Symbol.toStringTag] = "Message";
}
