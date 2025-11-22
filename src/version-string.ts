import { decodeBase64Int, encodeBase64Int } from "./encoding-base64.ts";
import { decodeUtf8 } from "./encoding-utf8.ts";

const REGEX_VERSION_STRING_PROTOCOL = /^[A-Z]{4}$/;
const REGEX_VERSION_JSON = /^\{"v":"(.*?)".*$/;

const Kind = {
  JSON: "JSON",
  CBOR: "CBOR",
  MSGPACK: "MGPK",
  CESR: "CESR",
} as const;
type Kind = (typeof Kind)[keyof typeof Kind];
const KIND_VALUES = new Set<Kind>(Object.values(Kind));

function encodeHexInt(value: number, length: number) {
  if (value >= 16 ** length) {
    throw new Error(
      `Value exceeds maximum for hex encoding. Expected value < ${16 ** length} for length ${length}, got ${value}`,
    );
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
      throw new Error(`Protocol must be 4 uppercase characters. Expected format: /^[A-Z]{4}$/, got "${init.protocol}"`);
    }

    const kind = init.kind ?? "JSON";
    if (!KIND_VALUES.has(kind as Kind)) {
      throw new Error(`Encoding kind must be one of ${Array.from(KIND_VALUES).join(", ")}, got "${kind}"`);
    }

    // TODO: Remove when other kinds are supported
    if (kind !== "JSON") {
      throw new Error(`Unsupported encoding kind "${kind}", only JSON format is supported for now`);
    }

    if (init.size !== undefined && init.size < 0) {
      throw new Error(`Size must be non-negative. Expected size >= 0, got ${init.size}`);
    }

    this.protocol = init.protocol;
    this.major = init.major ?? 1;
    this.minor = init.minor ?? 0;
    this.kind = kind;
    this.legacy = init.legacy ?? true;
    this.size = init.size ?? 0;
  }

  get text(): string {
    return VersionString.encode(this);
  }

  /**
   * Extrats and parses the version string from a message payload
   * @param input
   */
  static extract(input: Uint8Array | string): VersionString {
    if (typeof input !== "string") {
      input = decodeUtf8(input.slice(0, 24));
    }

    const match = input.match(REGEX_VERSION_JSON);
    if (!match) {
      const preview = typeof input === "string" ? input.slice(0, 50) : String(input).slice(0, 50);
      throw new Error(
        `Unable to extract "v" field. Expected JSON object with "v" property at start (format: {"v":"..."}), got "${preview}${input.length > 50 ? "..." : ""}"`,
      );
    }

    return VersionString.parse(match[1]);
  }

  /**
   * Parses a version string into a {@link VersionString} object
   *
   * @param input The version string
   * @returns The parsed {@link VersionString} object
   */
  static parse(input: string): VersionString {
    if (input.endsWith(".") && input.length === 16) {
      const protocol = input.slice(0, 4);
      const major = decodeBase64Int(input.slice(4, 5));
      const minor = decodeBase64Int(input.slice(5, 7));
      const kind = input.slice(7, 11);
      const size = decodeBase64Int(input.slice(12, 15));

      return new VersionString({
        protocol,
        major,
        minor,
        legacy: false,
        kind,
        size,
      });
    }

    if (input.endsWith("_") && input.length === 17) {
      const protocol = input.slice(0, 4);
      const major = parseInt(input.slice(4, 5), 16);
      const minor = parseInt(input.slice(5, 6), 16);
      const format = input.slice(6, 10);
      const size = parseInt(input.slice(10, 16), 16);

      return new VersionString({
        protocol,
        major,
        minor,
        kind: format,
        size,
        legacy: true,
      });
    }

    throw new Error(
      `Invalid version string format. Expected 17-char legacy format (ending with "_") or 16-char modern format (ending with "."), got "${input}"`,
    );
  }

  static encode(init: VersionStringInit): string {
    const protocol = init.protocol;
    const major = init.major ?? 1;
    const minor = init.minor ?? 0;
    const format = init.kind ?? "JSON";

    if (init.legacy) {
      const version = `${encodeHexInt(major, 1)}${encodeHexInt(minor, 1)}`;
      const size = encodeHexInt(init.size ?? 0, 6);
      return `${protocol}${version}${format}${size}_`;
    }

    const version = `${encodeBase64Int(major, 1)}${encodeBase64Int(minor, 2)}`;
    const size = encodeBase64Int(init.size ?? 0, 4);
    return `${protocol}${version}${format}${size}.`;
  }

  static readonly KERI_LEGACY = new VersionString({
    protocol: "KERI",
    major: 1,
    minor: 0,
    kind: "JSON",
    legacy: true,
  }).text;

  static readonly KERI = new VersionString({
    protocol: "KERI",
    major: 2,
    minor: 0,
    kind: "JSON",
    legacy: false,
  }).text;

  static readonly ACDC_LEGACY = new VersionString({
    protocol: "ACDC",
    major: 1,
    minor: 0,
    kind: "JSON",
    legacy: true,
  }).text;

  static readonly ACDC = new VersionString({
    protocol: "ACDC",
    major: 1,
    minor: 0,
    kind: "JSON",
    legacy: false,
  }).text;
}
