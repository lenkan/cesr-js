import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";
import { VersionString, type VersionStringInit } from "./version-string.ts";

const customInspectSymbol = Symbol.for("nodejs.util.inspect.custom");

export interface MessageBodyInit<T extends Record<string, unknown> = Record<string, unknown>> {
  payload: T;
  version?: VersionStringInit | VersionString;
}

function encode(init: MessageBodyInit): [VersionString, Uint8Array] {
  const tmpversion = new VersionString(
    init.version ?? {
      protocol: "KERI",
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { v: _v, ...payload } = init.payload;

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

  return [version, raw];
}

export class MessageBody<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly #raw: Uint8Array;
  readonly #version: VersionString;

  constructor(init: MessageBodyInit) {
    const [version, raw] = encode(init);
    this.#raw = raw;
    this.#version = version;
  }

  get version(): VersionString {
    return this.#version;
  }

  get text(): string {
    return decodeUtf8(this.#raw);
  }

  get payload(): T & { v: string } {
    return JSON.parse(decodeUtf8(this.#raw));
  }

  get raw(): Uint8Array {
    return this.#raw;
  }

  get size(): number {
    return this.#raw.length;
  }

  /**
   * Custom inspect function for pretty printing in Node.js console.
   * Example: console.log(message) will show this formatted output.
   * Also works in browsers with a simpler format.
   */
  [customInspectSymbol](depth: number): string {
    const payload = this.payload;

    if (depth < 0) {
      return "[Message]";
    }

    // Simple pretty print that works in both Node.js and browsers
    const payloadStr = JSON.stringify(payload, null, 2).replace(/\n/g, "\n  ");

    return ["MessageBody {", `  version: ${this.version.text}`, `  payload: ${payloadStr},`, "}"].join("\n");
  }

  static isMessageBody(value: Uint8Array): boolean {
    const start = value[0];
    return start === 0x7b; // '{' character
  }

  static parse(input: Uint8Array): MessageBody | null {
    if (input.length === 0) {
      return null;
    }

    if (!MessageBody.isMessageBody(input)) {
      const preview = decodeUtf8(input.slice(0, 20));
      throw new Error(`Expected JSON starting with '{' (0x7b), got: "${preview}"`);
    }

    if (input.length < 25) {
      return null;
    }

    const version = VersionString.parse(input.slice(0, 24));
    if (input.length < version.size) {
      return null;
    }

    const frame = input.slice(0, version.size);

    return new MessageBody({
      payload: JSON.parse(decodeUtf8(frame)),
      version,
    });
  }

  readonly [Symbol.toStringTag] = "Message";
}
