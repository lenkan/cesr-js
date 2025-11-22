import { basename } from "node:path";
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { VersionString } from "./version-string.ts";
import { encodeUtf8 } from "./encoding-utf8.ts";

describe(basename(import.meta.url), () => {
  describe("constructor defaults", () => {
    test("should default major version to 1", () => {
      const version = new VersionString({
        protocol: "KERI",
      });

      assert.strictEqual(version.major, 1);
    });

    test("should default minor version to 0", () => {
      const version = new VersionString({
        protocol: "KERI",
      });

      assert.strictEqual(version.minor, 0);
    });

    test("should default kind to JSON", () => {
      const version = new VersionString({
        protocol: "KERI",
      });

      assert.strictEqual(version.kind, "JSON");
    });

    test("should default legacy to true", () => {
      const version = new VersionString({
        protocol: "KERI",
      });

      assert.strictEqual(version.legacy, true);
    });
  });

  describe("legacy encoding", () => {
    test("should create legacy KERI version string with defaults", () => {
      const version = new VersionString({
        protocol: "KERI",
      });

      assert.strictEqual(version.text, "KERI10JSON000000_");
      assert.strictEqual(version.protocol, "KERI");
      assert.strictEqual(version.major, 1);
      assert.strictEqual(version.minor, 0);
      assert.strictEqual(version.kind, "JSON");
      assert.strictEqual(version.size, 0);
      assert.strictEqual(version.legacy, true);
    });

    test("should encode legacy KERI version specified size", () => {
      const version = new VersionString({
        protocol: "KERI",
        major: 2,
        minor: 5,
        legacy: true,
        size: 12345,
      });

      assert.strictEqual(version.text, "KERI25JSON003039_");
      assert.strictEqual(version.protocol, "KERI");
      assert.strictEqual(version.major, 2);
      assert.strictEqual(version.minor, 5);
      assert.strictEqual(version.size, 12345);
      assert.strictEqual(version.legacy, true);
    });

    test("should encode with different major version", () => {
      const version = new VersionString({
        protocol: "KERI",
        major: 5,
        minor: 0,
        legacy: true,
        size: 0,
      });

      assert.strictEqual(version.text, "KERI50JSON000000_");
    });

    test("should encode hexadecimal major version", () => {
      const version = new VersionString({
        protocol: "KERI",
        major: 10,
        minor: 0,
        legacy: true,
        size: 0,
      });

      assert.strictEqual(version.text, "KERIa0JSON000000_");
    });

    test("should encode with different minor version", () => {
      const version = new VersionString({
        protocol: "KERI",
        major: 1,
        minor: 5,
        legacy: true,
        size: 0,
      });

      assert.strictEqual(version.text, "KERI15JSON000000_");
    });

    test("should encode hexadecimal minor version", () => {
      const version = new VersionString({
        protocol: "KERI",
        major: 1,
        minor: 10,
        legacy: true,
        size: 0,
      });

      assert.strictEqual(version.text, "KERI1aJSON000000_");
    });

    test("should encode large size", () => {
      const version = new VersionString({
        protocol: "KERI",
        major: 1,
        minor: 0,
        legacy: true,
        size: 1048575,
      });

      assert.strictEqual(version.text, "KERI10JSON0fffff_");
    });
  });

  describe("modern encoding", () => {
    test("should create modern version string with defaults", () => {
      const version = new VersionString({
        protocol: "KERI",
        legacy: false,
      });

      assert.strictEqual(version.text, "KERIBAAJSONAAAA.");
      assert.strictEqual(version.protocol, "KERI");
      assert.strictEqual(version.major, 1);
      assert.strictEqual(version.minor, 0);
      assert.strictEqual(version.kind, "JSON");
      assert.strictEqual(version.size, 0);
      assert.strictEqual(version.legacy, false);
    });

    test("should encode modern version with specified size", () => {
      const version = new VersionString({
        protocol: "KERI",
        legacy: false,
        size: 12345,
      });

      assert.strictEqual(version.text, "KERIBAAJSONADA5.");
      assert.strictEqual(version.size, 12345);
    });

    test("should encode with different protocol", () => {
      const version = new VersionString({
        protocol: "ACDC",
        major: 1,
        minor: 0,
        legacy: false,
        size: 0,
      });

      assert.strictEqual(version.text, "ACDCBAAJSONAAAA.");
    });

    test("should encode modern version custom version", () => {
      const version = new VersionString({
        protocol: "KERI",
        major: 3,
        minor: 7,
        legacy: false,
      });

      assert.strictEqual(version.text, "KERIDAHJSONAAAA.");
      assert.strictEqual(version.protocol, "KERI");
      assert.strictEqual(version.major, 3);
      assert.strictEqual(version.minor, 7);
    });
  });

  describe("parsing legacy format", () => {
    test("should parse legacy KERI version from string", () => {
      const input = '{"v":"KERI10JSON000027_","test":"data"}';
      const version = VersionString.extract(input);

      assert.strictEqual(version.protocol, "KERI");
      assert.strictEqual(version.major, 1);
      assert.strictEqual(version.minor, 0);
      assert.strictEqual(version.kind, "JSON");
      assert.strictEqual(version.size, 39);
      assert.strictEqual(version.legacy, true);
    });

    test("should parse legacy KERI version from Uint8Array", () => {
      const input = encodeUtf8('{"v":"KERI10JSON000027_","test":"data"}');
      const version = VersionString.extract(input);

      assert.strictEqual(version.protocol, "KERI");
      assert.strictEqual(version.major, 1);
      assert.strictEqual(version.minor, 0);
      assert.strictEqual(version.kind, "JSON");
      assert.strictEqual(version.legacy, true);
    });

    test("should parse legacy ACDC version", () => {
      const input = '{"v":"ACDC10JSON000020_"}';
      const version = VersionString.extract(input);

      assert.strictEqual(version.protocol, "ACDC");
      assert.strictEqual(version.major, 1);
      assert.strictEqual(version.minor, 0);
      assert.strictEqual(version.kind, "JSON");
      assert.strictEqual(version.legacy, true);
    });

    test("should parse with different major/minor versions", () => {
      const input = '{"v":"KERI25JSON000000_"}';
      const version = VersionString.extract(input);

      assert.strictEqual(version.major, 2);
      assert.strictEqual(version.minor, 5);
    });

    test("should parse hexadecimal minor version", () => {
      const input = '{"v":"KERI1aJSON000000_"}';
      const version = VersionString.extract(input);

      assert.strictEqual(version.major, 1);
      assert.strictEqual(version.minor, 10); // 'a' in hex = 10
    });

    test("should parse large size", () => {
      const input = '{"v":"KERI10JSON0fffff_"}';
      const version = VersionString.extract(input);

      assert.strictEqual(version.size, 1048575); // 0xfffff
    });
  });

  describe("parsing modern format", () => {
    test("should parse modern KERI version from string", () => {
      const input = '{"v":"KERICABJSONAAAm.","test":"data"}';
      const version = VersionString.extract(input);

      assert.strictEqual(version.protocol, "KERI");
      assert.strictEqual(version.major, 2);
      assert.strictEqual(version.minor, 1);
      assert.strictEqual(version.kind, "JSON");
      assert.strictEqual(version.size, 38);
      assert.strictEqual(version.legacy, false);
    });

    test("should parse modern KERI version from Uint8Array", () => {
      const input = encodeUtf8('{"v":"KERICABJSONAAAm.","test":"data"}');
      const version = VersionString.extract(input);

      assert.strictEqual(version.protocol, "KERI");
      assert.strictEqual(version.major, 2);
      assert.strictEqual(version.minor, 1);
      assert.strictEqual(version.legacy, false);
    });

    test("should parse modern ACDC version", () => {
      const input = '{"v":"ACDCBAAJSONAAAA."}';
      const version = VersionString.extract(input);

      assert.strictEqual(version.protocol, "ACDC");
      assert.strictEqual(version.major, 1);
      assert.strictEqual(version.minor, 0);
      assert.strictEqual(version.kind, "JSON");
      assert.strictEqual(version.legacy, false);
    });

    test("should throw for missing v field", () => {
      const input = '{"test":"data"}';

      assert.throws(() => VersionString.extract(input), {
        message:
          'Unable to extract "v" field. Expected JSON object with "v" property at start (format: {"v":"..."}), got "{"test":"data"}"',
      });
    });

    test("should throw for invalid version string format", () => {
      const input = '{"v":"INVALID"}';

      assert.throws(() => VersionString.extract(input), {
        message:
          'Invalid version string format. Expected 17-char legacy format (ending with "_") or 16-char modern format (ending with "."), got "INVALID"',
      });
    });

    test("should throw for wrong terminator on legacy format", () => {
      const input = '{"v":"KERI10JSON000000."}'; // should end with _

      assert.throws(() => VersionString.extract(input), {
        message:
          'Invalid version string format. Expected 17-char legacy format (ending with "_") or 16-char modern format (ending with "."), got "KERI10JSON000000."',
      });
    });

    test("should throw for wrong terminator on modern format", () => {
      const input = '{"v":"KERICAAJSONAAAA_"}'; // should end with .

      assert.throws(() => VersionString.extract(input), {
        message:
          'Invalid version string format. Expected 17-char legacy format (ending with "_") or 16-char modern format (ending with "."), got "KERICAAJSONAAAA_"',
      });
    });
  });

  describe("round-trip encoding", () => {
    test("should round-trip legacy KERI version", () => {
      const original = new VersionString({
        protocol: "KERI",
        major: 1,
        minor: 5,
        legacy: true,
        size: 123,
      });

      const decoded = VersionString.parse(original.text);

      assert.strictEqual(decoded.protocol, original.protocol);
      assert.strictEqual(decoded.major, original.major);
      assert.strictEqual(decoded.minor, original.minor);
      assert.strictEqual(decoded.kind, original.kind);
      assert.strictEqual(decoded.size, original.size);
      assert.strictEqual(decoded.legacy, original.legacy);
    });

    test("should round-trip modern KERI version", () => {
      const original = new VersionString({
        protocol: "KERI",
        major: 3,
        minor: 7,
        legacy: false,
        size: 456,
      });

      const decoded = VersionString.parse(original.text);

      assert.strictEqual(decoded.protocol, original.protocol);
      assert.strictEqual(decoded.major, original.major);
      assert.strictEqual(decoded.minor, original.minor);
      assert.strictEqual(decoded.kind, original.kind);
      assert.strictEqual(decoded.size, original.size);
      assert.strictEqual(decoded.legacy, original.legacy);
    });
  });

  describe("static constants", () => {
    test("should have KERI_LEGACY constant", () => {
      assert.strictEqual(VersionString.KERI_LEGACY, "KERI10JSON000000_");
    });

    test("should have KERI constant", () => {
      assert.strictEqual(VersionString.KERI, "KERICAAJSONAAAA.");
    });

    test("should have ACDC_LEGACY constant", () => {
      assert.strictEqual(VersionString.ACDC_LEGACY, "ACDC10JSON000000_");
    });

    test("should have ACDC constant", () => {
      assert.strictEqual(VersionString.ACDC, "ACDCBAAJSONAAAA.");
    });
  });

  describe("error handling", () => {
    test("should throw for unsupported protocol", () => {
      assert.throws(
        () => {
          new VersionString({
            protocol: "INVALID",
            major: 1,
            minor: 0,
            legacy: true,
            size: 0,
          });
        },
        {
          message: 'Protocol must be 4 uppercase characters. Expected format: /^[A-Z]{4}$/, got "INVALID"',
        },
      );
    });

    test("should throw for invalid kind", () => {
      assert.throws(
        () => {
          new VersionString({
            protocol: "KERI",
            major: 1,
            minor: 0,
            kind: "XML",
            legacy: true,
            size: 0,
          });
        },
        {
          message: 'Encoding kind must be one of JSON, CBOR, MGPK, CESR, got "XML"',
        },
      );
    });

    test("should throw for negative size", () => {
      assert.throws(
        () => {
          new VersionString({
            protocol: "KERI",
            major: 1,
            minor: 0,
            legacy: true,
            size: -1,
          });
        },
        {
          message: "Size must be non-negative. Expected size >= 0, got -1",
        },
      );
    });
  });
});
