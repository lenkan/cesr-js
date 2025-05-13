import { type DataObject } from "./data-type.ts";
import { decodeBase64Int, encodeBase64Int } from "./base64.ts";

export interface Message {
  body: MessageBody;
  attachments: Record<string, string[]>;
}

export interface MessageBodyInit {
  protocol: string;
  major: number;
  minor: number;
}

export interface MessageBody {
  /**
   * The protocol, format and version of the message.
   */
  readonly protocol: string;

  /**
   * The text representation of the message.
   */
  readonly format: string;

  /**
   * The raw version of the message.
   */
  readonly raw: Uint8Array;
}

export interface Version {
  protocol: string;
  format: string;
  major: number;
  minor: number;
  size: number;
  legacy?: boolean;
}

const REGEX_PROTOCOL = /^[A-Z]{4}$/;
const REGEX_FORMAT = /^[A-Z]{4}$/;
const REGEX_VERSION = /^\{"v":"(.*?)".*$/;

export function decodeVersion(data: Uint8Array | string): Version {
  if (typeof data !== "string") {
    data = new TextDecoder().decode(data.slice(0, 24));
  }

  const match = data.match(REGEX_VERSION);
  if (!match) {
    throw new Error(`Unable to extract "v" field from ${data}`);
  }

  const value = match[1];

  // 'PPPPVVVKKKKBBBB.'
  if (value.endsWith(".") && value.length === 16) {
    const protocol = value.slice(0, 4);
    const major = decodeBase64Int(value.slice(4, 5));
    const minor = decodeBase64Int(value.slice(5, 7));
    const format = value.slice(7, 11);
    const size = decodeBase64Int(value.slice(12, 15));

    return {
      protocol,
      major,
      minor,
      format,
      size,
    };
  }

  // 'PPPPvvKKKKllllll_'
  if (value.endsWith("_") && value.length === 17) {
    const protocol = value.slice(0, 4);
    const major = parseInt(value.slice(4, 5), 16);
    const minor = parseInt(value.slice(5, 6), 16);
    const format = value.slice(6, 10);
    const size = parseInt(value.slice(10, 16), 16);

    return {
      protocol,
      major,
      minor,
      format,
      size,
    };
  }

  throw new Error(`Invalid version string ${value}`);
}

function encodeHex(value: number, length: number) {
  if (value >= 16 ** length) {
    throw new Error(`value ${value} too big for hex length ${length}`);
  }

  return value.toString(16).padStart(length, "0");
}

export function encodeVersionStringV1(version: Version): string {
  if (!REGEX_PROTOCOL.test(version.protocol)) {
    throw new Error("Protocol must be 4 characters");
  }

  if (!REGEX_FORMAT.test(version.format)) {
    throw new Error("Format must be 4 characters");
  }

  return [
    version.protocol,
    encodeHex(version.major, 1),
    encodeHex(version.minor, 1),
    version.format,
    encodeHex(version.size, 6),
    "_",
  ].join("");
}

export function encodeVersionString(version: Version): string {
  if (!REGEX_PROTOCOL.test(version.protocol)) {
    throw new Error("Protocol must be 4 characters");
  }

  if (!REGEX_FORMAT.test(version.format)) {
    throw new Error("Format must be 4 characters");
  }

  return [
    version.protocol,
    encodeBase64Int(version.major, 1),
    encodeBase64Int(version.minor, 2),
    version.format,
    encodeBase64Int(version.size, 4),
    ".",
  ].join("");
}

export function encodeMessageBodyV1<T extends DataObject>(data: T, init: MessageBodyInit): T & { v: string } {
  const encoder = new TextEncoder();
  const format = "JSON";

  const str = encoder.encode(
    JSON.stringify({
      v: encodeVersionStringV1({
        protocol: init.protocol,
        size: 0,
        format,
        major: 1,
        minor: 0,
      }),
      ...data,
    }),
  );

  const version = encodeVersionStringV1({
    protocol: "KERI",
    format: "JSON",
    size: str.byteLength,
    major: 1,
    minor: 0,
  });

  return {
    v: version,
    ...data,
  };
}

export function encodeMessageBody<T extends DataObject>(data: T, init: MessageBodyInit): T & { v: string } {
  const encoder = new TextEncoder();
  const format = "JSON";

  const str = encoder.encode(
    JSON.stringify({
      v: encodeVersionString({
        protocol: init.protocol,
        size: 0,
        format,
        major: init.major,
        minor: init.minor,
      }),
      ...data,
    }),
  );

  const version = encodeVersionString({
    protocol: init.protocol,
    size: str.byteLength,
    format,
    major: init.major,
    minor: init.minor,
  });

  return {
    v: version,
    ...data,
  };
}
