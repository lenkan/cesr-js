import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";
import { VersionString } from "./version-string.ts";

const customInspectSymbol = Symbol.for("nodejs.util.inspect.custom");

export type MessageBodyInit<T extends Record<string, unknown> = Record<string, unknown>> = T & { v: string };

function encode(init: MessageBodyInit): Uint8Array {
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

export class MessageBody<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly #raw: Uint8Array;

  constructor(init: MessageBodyInit) {
    this.#raw = encode(init);
  }

  get version(): VersionString {
    return VersionString.parse(this.payload.v);
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

  [customInspectSymbol](depth: number): string {
    const payload = this.payload;

    if (depth < 0) {
      return "[MessageBody]";
    }

    const payloadStr = JSON.stringify(payload, null, 2).replace(/\n/g, "\n  ");

    return ["MessageBody {", `  version: ${this.version.text}`, `  payload: ${payloadStr},`, "}"].join("\n");
  }

  static isMessageBody(value: Uint8Array): boolean {
    const start = value[0];
    return start === 0x7b; // '{' character
  }

  static encode(init: MessageBodyInit): Uint8Array {
    return encode(init);
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

    const version = VersionString.extract(input.slice(0, 24));
    if (input.length < version.size) {
      return null;
    }

    const frame = input.slice(0, version.size);

    return new MessageBody(JSON.parse(decodeUtf8(frame)));
  }

  readonly [Symbol.toStringTag] = "Message";
}
