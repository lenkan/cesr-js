import { type DataObject } from "./data-type.ts";
import { decodeBase64Int } from "./base64.ts";

export interface Version {
  protocol: string;
  format: string;
  version: string;
  size: number;
}

// PPPPvvKKKKllllll_
const LEGACY_MATCH = /^[A-Z]{4}[0-9]{2}[A-Z]{4}.*$/;

// PPPPVVVKKKKBBBB.
const MATCH = /^[A-Z]{4}[0-9]{3}[A-Z]{4}.*$/;

export function parseVersion(data: Uint8Array | string): Version {
  if (typeof data !== "string") {
    return parseVersion(new TextDecoder().decode(data));
  }

  const value = data.slice(6);
  if (LEGACY_MATCH.test(value)) {
    const protocol = value.slice(0, 4);
    const version = value.slice(4, 6);
    const format = value.slice(6, 10);
    const size = parseInt(value.slice(10, 16), 16);

    return {
      protocol,
      version,
      format,
      size,
    };
  } else if (MATCH.test(value)) {
    const protocol = value.slice(0, 4);
    const version = value.slice(4, 7);
    const format = value.slice(7, 11);
    const size = decodeBase64Int(value.slice(12, 15));

    return {
      protocol,
      version,
      format,
      size,
    };
  }

  throw new Error(`Unexpected version string ${value}`);
}

function formatSize(size: number) {
  return size.toString(16).padStart(6, "0");
}

function formatVersion(version: Version) {
  switch (version.format) {
    case "JSON":
      break;
    default:
      throw new Error(`Unsupported format ${version.format}`);
  }

  switch (version.protocol) {
    case "KERI":
      return `KERI10${version.format}${formatSize(version.size)}_`;
    default:
      throw new Error(`Unsupported protocol ${version.protocol}`);
  }
}

// const DUMMY_VERSION = "PPPPVVVKKKKBBBB.";
// const DUMMY_LEGACY_VERSION = "PPPPvvKKKKllllll_";

export function versify<T extends DataObject>(data: T): T & { v: string } {
  const encoder = new TextEncoder();
  const str = encoder.encode(
    JSON.stringify({
      v: formatVersion({
        protocol: "KERI",
        size: 0,
        format: "JSON",
        version: "1.0",
      }),
      ...data,
    }),
  );

  const version = formatVersion({
    protocol: "KERI",
    format: "JSON",
    size: str.byteLength,
    version: "1.0",
  });

  return {
    v: version,
    ...data,
  };
}
