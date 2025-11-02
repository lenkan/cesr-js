import { decodeBase64Int, encodeBase64Int } from "./encoding-base64.ts";
import { decodeUtf8 } from "./encoding-utf8.ts";

const REGEX_VERSION_STRING_PROTOCOL = /^[A-Z]{4}$/;
const REGEX_VERSION_STRING_KIND = /^[A-Z]{4}$/;
const REGEX_VERSION_JSON = /^\{"v":"(.*?)".*$/;

function encodeHexInt(value: number, length: number) {
  if (value >= 16 ** length) {
    throw new Error(`value ${value} too big for hex length ${length}`);
  }

  return value.toString(16).padStart(length, "0");
}

export interface VersionStringInit {
  protocol: string;
  major?: number;
  minor?: number;
  kind?: string;
  legacy?: boolean;
  size?: number;
}

export class VersionString {
  readonly protocol: string;
  readonly major: number;
  readonly minor: number;
  readonly kind: string;
  readonly legacy: boolean;
  readonly size: number;

  constructor(init: VersionStringInit) {
    if (!REGEX_VERSION_STRING_PROTOCOL.test(init.protocol)) {
      throw new Error("Protocol must be 4 uppercase characters");
    }

    const kind = init.kind ?? "JSON";
    if (!REGEX_VERSION_STRING_KIND.test(kind)) {
      throw new Error("Kind must be 4 uppercase characters");
    }

    if (kind !== "JSON") {
      throw new Error("Only JSON format is supported for now");
    }

    this.protocol = init.protocol;
    this.major = init.major ?? 1;
    this.minor = init.minor ?? 0;
    this.kind = kind;
    this.legacy = init.legacy ?? true;
    this.size = init.size ?? 0;
  }

  get text(): string {
    const protocol = this.protocol;
    const major = this.major ?? 1;
    const minor = this.minor ?? 0;
    const format = this.kind ?? "JSON";

    if (this.legacy) {
      const version = `${encodeHexInt(major, 1)}${encodeHexInt(minor, 1)}`;
      const size = encodeHexInt(this.size ?? 0, 6);
      return `${protocol}${version}${format}${size}_`;
    }

    const version = `${encodeBase64Int(major, 1)}${encodeBase64Int(minor, 2)}`;
    const size = encodeBase64Int(this.size ?? 0, 4);
    return `${protocol}${version}${format}${size}.`;
  }

  static parse(input: Uint8Array | string): VersionString {
    if (typeof input !== "string") {
      input = decodeUtf8(input.slice(0, 24));
    }

    const match = input.match(REGEX_VERSION_JSON);
    if (!match) {
      throw new Error(`Unable to extract "v" field from ${input}`);
    }

    const value = match[1];

    if (value.endsWith(".") && value.length === 16) {
      const protocol = value.slice(0, 4);
      const major = decodeBase64Int(value.slice(4, 5));
      const minor = decodeBase64Int(value.slice(5, 7));
      const kind = value.slice(7, 11);
      const size = decodeBase64Int(value.slice(12, 15));

      return new VersionString({
        protocol,
        major,
        minor,
        legacy: false,
        kind,
        size,
      });
    }

    if (value.endsWith("_") && value.length === 17) {
      const protocol = value.slice(0, 4);
      const major = parseInt(value.slice(4, 5), 16);
      const minor = parseInt(value.slice(5, 6), 16);
      const format = value.slice(6, 10);
      const size = parseInt(value.slice(10, 16), 16);

      return new VersionString({
        protocol,
        major,
        minor,
        kind: format,
        size,
        legacy: true,
      });
    }

    throw new Error(`Invalid version string ${value}`);
  }

  static readonly KERI_LEGACY = new VersionString({
    protocol: "KERI",
    major: 1,
    minor: 0,
    kind: "JSON",
    legacy: true,
  });

  static readonly KERI = new VersionString({
    protocol: "KERI",
    major: 2,
    minor: 0,
    kind: "JSON",
    legacy: false,
  });

  static readonly ACDC_LEGACY = new VersionString({
    protocol: "ACDC",
    major: 1,
    minor: 0,
    kind: "JSON",
    legacy: true,
  });

  static readonly ACDC = new VersionString({
    protocol: "ACDC",
    major: 1,
    minor: 0,
    kind: "JSON",
    legacy: false,
  });
}
