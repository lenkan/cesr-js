import { type DataObject } from "./data-type.ts";
import { decodeBase64Int, encodeBase64Int } from "./base64.ts";

export interface Version {
  protocol: string;
  format: string;
  major: number;
  minor: number;
  size: number;
  legacy?: boolean;
}

// VERSION = "PPPPVVVKKKKBBBB.";
// LEGACY_VERSION = "PPPPvvKKKKllllll_";
const REGEX_PROTOCOL = /^[A-Z]{4}$/;
const REGEX_FORMAT = /^[A-Z]{4}$/;
const REGEX_VERSION = /^\{"v":"(.*?)".*$/;

export function decodeVersion(data: Uint8Array | string): Version {
  if (typeof data !== "string") {
    return decodeVersion(new TextDecoder().decode(data));
  }

  const match = data.match(REGEX_VERSION);
  if (!match) {
    throw new Error(`Unable to extract "v" field from ${data}`);
  }

  const value = match[1];

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
      legacy: true,
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

export function encodeVersion(version: Version): string {
  if (!REGEX_PROTOCOL.test(version.protocol)) {
    throw new Error("Protocol must be 4 characters");
  }

  if (!REGEX_FORMAT.test(version.format)) {
    throw new Error("Format must be 4 characters");
  }

  if (version.legacy) {
    return [
      version.protocol,
      encodeHex(version.major, 1),
      encodeHex(version.minor, 1),
      version.format,
      encodeHex(version.size, 6),
      "_",
    ].join("");
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

export function versify<T extends DataObject>(data: T, legacy = false): T & { v: string } {
  const encoder = new TextEncoder();
  const str = encoder.encode(
    JSON.stringify({
      v: encodeVersion({
        protocol: "KERI",
        size: 0,
        format: "JSON",
        major: 1,
        minor: 0,
        legacy,
      }),
      ...data,
    }),
  );

  const version = encodeVersion({
    protocol: "KERI",
    format: "JSON",
    size: str.byteLength,
    major: 1,
    minor: 0,
    legacy,
  });

  return {
    v: version,
    ...data,
  };
}
