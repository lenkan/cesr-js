import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { VersionString } from "./version-string.ts";
import { encodeUtf8 } from "./encoding-utf8.ts";

describe("VersionString constructor", () => {
  test("Should create legacy KERI version string", () => {
    const version = new VersionString({
      protocol: "KERI",
      major: 1,
      minor: 0,
      legacy: true,
      size: 100,
    });

    assert.strictEqual(version.protocol, "KERI");
    assert.strictEqual(version.major, 1);
    assert.strictEqual(version.minor, 0);
    assert.strictEqual(version.kind, "JSON");
    assert.strictEqual(version.legacy, true);
    assert.strictEqual(version.size, 100);
  });

  test("Should create modern KERI version string", () => {
    const version = new VersionString({
      protocol: "KERI",
      major: 2,
      minor: 1,
      legacy: false,
      size: 50,
    });

    assert.strictEqual(version.protocol, "KERI");
    assert.strictEqual(version.major, 2);
    assert.strictEqual(version.minor, 1);
    assert.strictEqual(version.kind, "JSON");
    assert.strictEqual(version.legacy, false);
    assert.strictEqual(version.size, 50);
  });

  test("Should default to legacy format when legacy not specified", () => {
    const version = new VersionString({
      protocol: "KERI",
    });

    assert.strictEqual(version.legacy, true);
  });

  test("Should default to major version 1 when not specified", () => {
    const version = new VersionString({
      protocol: "KERI",
    });

    assert.strictEqual(version.major, 1);
  });

  test("Should default to minor version 0 when not specified", () => {
    const version = new VersionString({
      protocol: "KERI",
    });

    assert.strictEqual(version.minor, 0);
  });

  test("Should default to JSON kind when not specified", () => {
    const version = new VersionString({
      protocol: "KERI",
    });

    assert.strictEqual(version.kind, "JSON");
  });

  test("Should default to size 0 when not specified", () => {
    const version = new VersionString({
      protocol: "KERI",
    });

    assert.strictEqual(version.size, 0);
  });

  test("Should throw for invalid protocol (too short) in constructor", () => {
    assert.throws(() => new VersionString({ protocol: "KER" }), /Protocol must be 4 uppercase characters/);
  });

  test("Should throw for invalid protocol (too long) in constructor", () => {
    assert.throws(() => new VersionString({ protocol: "KERIO" }), /Protocol must be 4 uppercase characters/);
  });

  test("Should throw for invalid protocol (lowercase) in constructor", () => {
    assert.throws(() => new VersionString({ protocol: "keri" }), /Protocol must be 4 uppercase characters/);
  });

  test("Should throw for invalid protocol (mixed case) in constructor", () => {
    assert.throws(() => new VersionString({ protocol: "KERi" }), /Protocol must be 4 uppercase characters/);
  });

  test("Should throw for invalid protocol (with numbers) in constructor", () => {
    assert.throws(() => new VersionString({ protocol: "KER1" }), /Protocol must be 4 uppercase characters/);
  });

  test("Should throw for non-JSON kind in constructor", () => {
    assert.throws(() => new VersionString({ protocol: "KERI", kind: "CBOR" }), /Only JSON format is supported for now/);
  });

  test("Should throw for invalid kind (too short) in constructor", () => {
    assert.throws(() => new VersionString({ protocol: "KERI", kind: "JSO" }), /Kind must be 4 uppercase characters/);
  });

  test("Should throw for invalid kind (too long) in constructor", () => {
    assert.throws(() => new VersionString({ protocol: "KERI", kind: "JSONX" }), /Kind must be 4 uppercase characters/);
  });
});

describe("VersionString.text (encoding)", () => {
  test("Should encode legacy KERI version string", () => {
    const version = new VersionString({
      protocol: "KERI",
      major: 1,
      minor: 0,
      legacy: true,
      size: 0,
    });

    assert.strictEqual(version.text, "KERI10JSON000000_");
  });

  test("Should encode legacy KERI version with non-zero size", () => {
    const version = new VersionString({
      protocol: "KERI",
      major: 1,
      minor: 0,
      legacy: true,
      size: 255,
    });

    assert.strictEqual(version.text, "KERI10JSON0000ff_");
  });

  test("Should encode legacy KERI version with large size", () => {
    const version = new VersionString({
      protocol: "KERI",
      major: 1,
      minor: 0,
      legacy: true,
      size: 16777215, // max 6 hex digits
    });

    assert.strictEqual(version.text, "KERI10JSONffffff_");
  });

  test("Should encode modern KERI version string", () => {
    const version = new VersionString({
      protocol: "KERI",
      major: 2,
      minor: 0,
      legacy: false,
      size: 0,
    });

    assert.strictEqual(version.text, "KERICAAJSONAAAA.");
  });

  test("Should encode modern KERI version with non-zero size", () => {
    const version = new VersionString({
      protocol: "KERI",
      major: 2,
      minor: 1,
      legacy: false,
      size: 24,
    });

    assert.strictEqual(version.text, "KERICABJSONAAAY.");
  });

  test("Should encode legacy ACDC version string", () => {
    const version = new VersionString({
      protocol: "ACDC",
      major: 1,
      minor: 0,
      legacy: true,
      size: 0,
    });

    assert.strictEqual(version.text, "ACDC10JSON000000_");
  });

  test("Should encode modern ACDC version string", () => {
    const version = new VersionString({
      protocol: "ACDC",
      major: 1,
      minor: 0,
      legacy: false,
      size: 0,
    });

    assert.strictEqual(version.text, "ACDCBAAJSONAAAA.");
  });

  test("Should encode with different major versions", () => {
    const version = new VersionString({
      protocol: "KERI",
      major: 5,
      minor: 0,
      legacy: true,
      size: 0,
    });

    assert.strictEqual(version.text, "KERI50JSON000000_");
  });

  test("Should encode with different minor versions in legacy format", () => {
    const version = new VersionString({
      protocol: "KERI",
      major: 1,
      minor: 5,
      legacy: true,
      size: 0,
    });

    assert.strictEqual(version.text, "KERI15JSON000000_");
  });
});

describe("VersionString.parse (decoding)", () => {
  test("Should parse legacy KERI version from string", () => {
    const input = '{"v":"KERI10JSON000027_","test":"data"}';
    const version = VersionString.parse(input);

    assert.strictEqual(version.protocol, "KERI");
    assert.strictEqual(version.major, 1);
    assert.strictEqual(version.minor, 0);
    assert.strictEqual(version.kind, "JSON");
    assert.strictEqual(version.size, 39);
    assert.strictEqual(version.legacy, true);
  });

  test("Should parse modern KERI version from string", () => {
    const input = '{"v":"KERICABJSONAAAm.","test":"data"}';
    const version = VersionString.parse(input);

    assert.strictEqual(version.protocol, "KERI");
    assert.strictEqual(version.major, 2);
    assert.strictEqual(version.minor, 1);
    assert.strictEqual(version.kind, "JSON");
    assert.strictEqual(version.size, 38);
    assert.strictEqual(version.legacy, false);
  });

  test("Should parse legacy KERI version from Uint8Array", () => {
    const input = encodeUtf8('{"v":"KERI10JSON000027_","test":"data"}');
    const version = VersionString.parse(input);

    assert.strictEqual(version.protocol, "KERI");
    assert.strictEqual(version.major, 1);
    assert.strictEqual(version.minor, 0);
    assert.strictEqual(version.kind, "JSON");
    assert.strictEqual(version.legacy, true);
  });

  test("Should parse modern KERI version from Uint8Array", () => {
    const input = encodeUtf8('{"v":"KERICABJSONAAAm.","test":"data"}');
    const version = VersionString.parse(input);

    assert.strictEqual(version.protocol, "KERI");
    assert.strictEqual(version.major, 2);
    assert.strictEqual(version.minor, 1);
    assert.strictEqual(version.legacy, false);
  });

  test("Should parse legacy ACDC version", () => {
    const input = '{"v":"ACDC10JSON000020_"}';
    const version = VersionString.parse(input);

    assert.strictEqual(version.protocol, "ACDC");
    assert.strictEqual(version.major, 1);
    assert.strictEqual(version.minor, 0);
    assert.strictEqual(version.kind, "JSON");
    assert.strictEqual(version.legacy, true);
  });

  test("Should parse modern ACDC version", () => {
    const input = '{"v":"ACDCBAAJSONAAAA."}';
    const version = VersionString.parse(input);

    assert.strictEqual(version.protocol, "ACDC");
    assert.strictEqual(version.major, 1);
    assert.strictEqual(version.minor, 0);
    assert.strictEqual(version.kind, "JSON");
    assert.strictEqual(version.legacy, false);
  });

  test("Should parse with different major/minor versions (legacy)", () => {
    const input = '{"v":"KERI25JSON000000_"}';
    const version = VersionString.parse(input);

    assert.strictEqual(version.major, 2);
    assert.strictEqual(version.minor, 5);
  });

  test("Should parse hexadecimal minor version in legacy format", () => {
    const input = '{"v":"KERI1aJSON000000_"}';
    const version = VersionString.parse(input);

    assert.strictEqual(version.major, 1);
    assert.strictEqual(version.minor, 10); // 'a' in hex = 10
  });

  test("Should parse large size in legacy format", () => {
    const input = '{"v":"KERI10JSON0fffff_"}';
    const version = VersionString.parse(input);

    assert.strictEqual(version.size, 1048575); // 0xfffff
  });

  test("Should throw for missing v field", () => {
    const input = '{"test":"data"}';

    assert.throws(() => VersionString.parse(input), /Unable to extract "v" field/);
  });

  test("Should throw for invalid version string format", () => {
    const input = '{"v":"INVALID"}';

    assert.throws(() => VersionString.parse(input), /Invalid version string INVALID/);
  });

  test("Should throw for wrong terminator on legacy format", () => {
    const input = '{"v":"KERI10JSON000000."}'; // should end with _

    assert.throws(() => VersionString.parse(input), /Invalid version string/);
  });

  test("Should throw for wrong terminator on modern format", () => {
    const input = '{"v":"KERICAAJSONAAAA_"}'; // should end with .

    assert.throws(() => VersionString.parse(input), /Invalid version string/);
  });
});

describe("VersionString static constants", () => {
  test("Should have KERI_LEGACY constant", () => {
    assert.strictEqual(VersionString.KERI_LEGACY.protocol, "KERI");
    assert.strictEqual(VersionString.KERI_LEGACY.major, 1);
    assert.strictEqual(VersionString.KERI_LEGACY.minor, 0);
    assert.strictEqual(VersionString.KERI_LEGACY.kind, "JSON");
    assert.strictEqual(VersionString.KERI_LEGACY.legacy, true);
  });

  test("Should have KERI constant", () => {
    assert.strictEqual(VersionString.KERI.protocol, "KERI");
    assert.strictEqual(VersionString.KERI.major, 2);
    assert.strictEqual(VersionString.KERI.minor, 0);
    assert.strictEqual(VersionString.KERI.kind, "JSON");
    assert.strictEqual(VersionString.KERI.legacy, false);
  });

  test("Should have ACDC_LEGACY constant", () => {
    assert.strictEqual(VersionString.ACDC_LEGACY.protocol, "ACDC");
    assert.strictEqual(VersionString.ACDC_LEGACY.major, 1);
    assert.strictEqual(VersionString.ACDC_LEGACY.minor, 0);
    assert.strictEqual(VersionString.ACDC_LEGACY.kind, "JSON");
    assert.strictEqual(VersionString.ACDC_LEGACY.legacy, true);
  });

  test("Should have ACDC constant", () => {
    assert.strictEqual(VersionString.ACDC.protocol, "ACDC");
    assert.strictEqual(VersionString.ACDC.major, 1);
    assert.strictEqual(VersionString.ACDC.minor, 0);
    assert.strictEqual(VersionString.ACDC.kind, "JSON");
    assert.strictEqual(VersionString.ACDC.legacy, false);
  });
});

describe("VersionString round-trip encoding/decoding", () => {
  test("Should round-trip legacy KERI version", () => {
    const original = new VersionString({
      protocol: "KERI",
      major: 1,
      minor: 5,
      legacy: true,
      size: 123,
    });

    const encoded = `{"v":"${original.text}"}`;
    const decoded = VersionString.parse(encoded);

    assert.strictEqual(decoded.protocol, original.protocol);
    assert.strictEqual(decoded.major, original.major);
    assert.strictEqual(decoded.minor, original.minor);
    assert.strictEqual(decoded.kind, original.kind);
    assert.strictEqual(decoded.size, original.size);
    assert.strictEqual(decoded.legacy, original.legacy);
  });

  test("Should round-trip modern KERI version", () => {
    const original = new VersionString({
      protocol: "KERI",
      major: 3,
      minor: 7,
      legacy: false,
      size: 456,
    });

    const encoded = `{"v":"${original.text}"}`;
    const decoded = VersionString.parse(encoded);

    assert.strictEqual(decoded.protocol, original.protocol);
    assert.strictEqual(decoded.major, original.major);
    assert.strictEqual(decoded.minor, original.minor);
    assert.strictEqual(decoded.kind, original.kind);
    assert.strictEqual(decoded.size, original.size);
    assert.strictEqual(decoded.legacy, original.legacy);
  });

  test("Should round-trip ACDC versions", () => {
    const protocols = ["ACDC", "KERI"];
    const legacyModes = [true, false];

    for (const protocol of protocols) {
      for (const legacy of legacyModes) {
        const original = new VersionString({
          protocol,
          major: 2,
          minor: 3,
          legacy,
          size: 100,
        });

        const encoded = `{"v":"${original.text}"}`;
        const decoded = VersionString.parse(encoded);

        assert.strictEqual(decoded.protocol, original.protocol);
        assert.strictEqual(decoded.major, original.major);
        assert.strictEqual(decoded.minor, original.minor);
        assert.strictEqual(decoded.legacy, original.legacy);
      }
    }
  });
});
