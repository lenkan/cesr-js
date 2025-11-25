import { basename } from "node:path";
import { describe, test } from "node:test";
import {
  decodeCounter,
  decodeDate,
  decodeGenus,
  decodeString,
  encodeCounter,
  encodeDate,
  encodeGenus,
  encodeMap,
  encodeMatter,
  encodeNumber,
  encodeString,
} from "./encoding.ts";
import assert from "node:assert";
import { encodeUtf8 } from "./encoding-utf8.ts";
import { CountCode_10, CountCode_20 } from "./codes.ts";

describe(basename(import.meta.url), () => {
  describe("encoding matter primitives", () => {
    test("should throw if raw does not have enough bytes", () => {
      assert.throws(() => {
        encodeMatter({ code: "0B", raw: new Uint8Array(63) });
      }, new Error("Encoded size 86 does not match expected size 88"));
    });

    test("should encode fixed size primitive", () => {
      const result = encodeMatter({
        code: "E",
        raw: new Uint8Array(32),
      });

      assert.strictEqual(result, `E${"A".repeat(43)}`);
    });

    test("should encode 2 char code fixed size primitive", () => {
      const result = encodeMatter({
        code: "0B",
        raw: new Uint8Array(64),
      });

      assert.strictEqual(result, `0B${"A".repeat(86)}`);
    });

    test("should encode small variable size lead 0", () => {
      const text = encodeMatter({
        code: "4B",
        raw: encodeUtf8("foo"),
      });

      assert.strictEqual(text.length % 4, 0);
      assert.strictEqual(text, "4BABZm9v");
    });

    test("should encode small variable size lead 1", () => {
      const text = encodeMatter({
        code: "5B",
        raw: encodeUtf8("foooo"),
      });
      assert.strictEqual(text.length % 4, 0);
      assert.strictEqual(text, "5BACAGZvb29v");
    });

    test("should encode small variable size lead 2", () => {
      const text = encodeMatter({
        code: "6B",
        raw: encodeUtf8("fooo"),
      });

      assert.strictEqual(text.length % 4, 0);
      assert.strictEqual(text, "6BACAABmb29v");
    });
  });

  describe("encoding numbers", () => {
    test("should encode 0", () => {
      assert.strictEqual(encodeNumber(0), "6HABAAA0");
    });

    test("should encode -0", () => {
      assert.strictEqual(encodeNumber(-0), "6HABAAA0");
    });

    test("should encode 0.1", () => {
      assert.strictEqual(encodeNumber(0.1), "4HABA0p1");
    });

    test("should encode 1", () => {
      assert.strictEqual(encodeNumber(1), "6HABAAA1");
    });

    test("should encode 123", () => {
      assert.strictEqual(encodeNumber(123), "4HABA123");
    });

    test("should encode 1.1", () => {
      assert.strictEqual(encodeNumber(1.1), "4HABA1p1");
    });

    test("should encode -1.1", () => {
      assert.strictEqual(encodeNumber(-1.1), "4HAB-1p1");
    });

    test("should encode 12345678", () => {
      assert.strictEqual(encodeNumber(12345678), "4HAC12345678");
    });

    test("should encode MAX_SAFE_INTEGER", () => {
      assert.strictEqual(encodeNumber(Number.MAX_SAFE_INTEGER), "4HAE9007199254740991");
    });
  });

  describe("encoding strings", () => {
    test("should encode/decode 'abc'", () => {
      const value = "abc";
      const expected = "4AABAabc";
      assert.strictEqual(encodeString(value), expected);
      assert.strictEqual(decodeString(expected), value);
    });

    test("should encode/decode large string", () => {
      const value = "a".repeat(100000);

      assert.match(encodeString(value), /^7AAA/);
    });

    test("should encode/decode 'Foobar'", () => {
      const value = "Foobar";
      const expected = "5AACAAFoobar";
      assert.strictEqual(encodeString(value), expected);
      assert.strictEqual(decodeString(expected), value);
    });

    test("should encode/decode 'Foobars'", () => {
      const value = "Foobars";
      const expected = "4AACAFoobars";
      assert.strictEqual(encodeString(value), expected);
      assert.strictEqual(decodeString(expected), value);
    });

    test("should encode/decode 'ABC' (non-base64)", () => {
      const value = "ABC";
      const expected = "4BABQUJD"; // Cannot start with A for base64
      assert.strictEqual(encodeString(value), expected);
      assert.strictEqual(decodeString(expected), value);
    });

    test("should encode/decode 'Hello World!'", () => {
      const value = "Hello World!";
      const expected = "4BAESGVsbG8gV29ybGQh";
      assert.strictEqual(encodeString(value), expected);
      assert.strictEqual(decodeString(expected), value);
    });

    test("should encode/decode 'Foobars!'", () => {
      const value = "Foobars!";
      const expected = "5BADAEZvb2JhcnMh";
      assert.strictEqual(encodeString(value), expected);
      assert.strictEqual(decodeString(expected), value);
    });

    test("should encode/decode special characters", () => {
      const value = '$£!=)#)!(!#!=()#!()/()"#!/';
      const expected = "4BAJJMKjIT0pIykhKCEjIT0oKSMhKCkvKCkiIyEv";
      assert.strictEqual(encodeString(value), expected);
      assert.strictEqual(decodeString(expected), value);
    });

    test("should encode/decode path '-a-b-c'", () => {
      const value = "-a-b-c";
      const expected = "5AACAA-a-b-c";
      assert.strictEqual(encodeString(value), expected);
      assert.strictEqual(decodeString(expected), value);
    });

    test("should encode/decode path '-a-abc'", () => {
      const value = "-a-abc";
      const expected = "5AACAA-a-abc";
      assert.strictEqual(encodeString(value), expected);
      assert.strictEqual(decodeString(expected), value);
    });

    test("should encode/decode path '-a-abcdef'", () => {
      const value = "-a-abcdef";
      const expected = "6AADAAA-a-abcdef";
      assert.strictEqual(encodeString(value), expected);
      assert.strictEqual(decodeString(expected), value);
    });

    test("should encode/decode path '-A-ABC-c'", () => {
      const value = "-A-ABC-c";
      const expected = "4AAC-A-ABC-c";
      assert.strictEqual(encodeString(value), expected);
      assert.strictEqual(decodeString(expected), value);
    });
  });

  describe("encoding dates", () => {
    test("should encode CESR date format", () => {
      const result = encodeDate(new Date(Date.parse("2024-11-23T16:02:27.123Z")));
      assert.strictEqual(result, "1AAG2024-11-23T16c02c27d123000p00c00");
    });
    test("should encode a standard date", () => {
      const date = new Date("2024-11-23T16:02:27.123Z");
      const encoded = encodeDate(date);
      assert.strictEqual(encoded, "1AAG2024-11-23T16c02c27d123000p00c00");
    });

    test("should decode an encoded date", () => {
      const original = new Date("2024-11-23T16:02:27.123Z");
      const encoded = encodeDate(original);
      const decoded = decodeDate(encoded);
      assert.strictEqual(decoded.toISOString(), original.toISOString());
    });

    test("should handle epoch time", () => {
      const date = new Date(0); // 1970-01-01T00:00:00.000Z
      const encoded = encodeDate(date);
      const decoded = decodeDate(encoded);
      assert.strictEqual(decoded.getTime(), date.getTime());
    });

    test("should handle dates with zero milliseconds", () => {
      const date = new Date("2024-01-15T10:30:45.000Z");
      const encoded = encodeDate(date);
      const decoded = decodeDate(encoded);
      assert.strictEqual(decoded.toISOString(), date.toISOString());
    });

    test("should handle dates with maximum milliseconds", () => {
      const date = new Date("2024-06-30T23:59:59.999Z");
      const encoded = encodeDate(date);
      const decoded = decodeDate(encoded);
      assert.strictEqual(decoded.toISOString(), date.toISOString());
    });

    test("should handle year boundaries", () => {
      const newYear = new Date("2025-01-01T00:00:00.000Z");
      const encoded = encodeDate(newYear);
      const decoded = decodeDate(encoded);
      assert.strictEqual(decoded.toISOString(), newYear.toISOString());
    });

    test("should handle different months", () => {
      const dates = [
        new Date("2024-01-15T12:00:00.000Z"), // January
        new Date("2024-06-15T12:00:00.000Z"), // June
        new Date("2024-12-15T12:00:00.000Z"), // December
      ];

      for (const date of dates) {
        const encoded = encodeDate(date);
        const decoded = decodeDate(encoded);
        assert.strictEqual(decoded.toISOString(), date.toISOString());
      }
    });

    test("should preserve UTC time correctly", () => {
      const date = new Date("2024-07-04T14:30:15.456Z");
      const encoded = encodeDate(date);
      const decoded = decodeDate(encoded);

      assert.strictEqual(decoded.getUTCFullYear(), date.getUTCFullYear());
      assert.strictEqual(decoded.getUTCMonth(), date.getUTCMonth());
      assert.strictEqual(decoded.getUTCDate(), date.getUTCDate());
      assert.strictEqual(decoded.getUTCHours(), date.getUTCHours());
      assert.strictEqual(decoded.getUTCMinutes(), date.getUTCMinutes());
      assert.strictEqual(decoded.getUTCSeconds(), date.getUTCSeconds());
      assert.strictEqual(decoded.getUTCMilliseconds(), date.getUTCMilliseconds());
    });

    test("should throw error for invalid date", () => {
      const invalidDate = new Date("invalid");
      assert.throws(() => {
        encodeDate(invalidDate);
      }, /Invalid date/);
    });

    test("should round-trip multiple times consistently", () => {
      const original = new Date("2024-03-21T08:15:30.789Z");

      // Encode and decode multiple times
      let current = original;
      for (let i = 0; i < 3; i++) {
        const encoded = encodeDate(current);
        current = decodeDate(encoded);
      }

      assert.strictEqual(current.toISOString(), original.toISOString());
    });

    test("should handle current date and time", () => {
      const now = new Date();
      const encoded = encodeDate(now);
      const decoded = decodeDate(encoded);

      // Should be equal to millisecond precision
      assert.strictEqual(decoded.getTime(), now.getTime());
    });

    test("should decode from Uint8Array", () => {
      const date = new Date("2024-11-23T16:02:27.123Z");
      const encoded = encodeDate(date);
      const bytes = encodeUtf8(encoded);
      const decoded = decodeDate(bytes);

      assert.strictEqual(decoded.toISOString(), date.toISOString());
    });

    test("should handle leap year date", () => {
      const leapDay = new Date("2024-02-29T12:00:00.000Z"); // 2024 is a leap year
      const encoded = encodeDate(leapDay);
      const decoded = decodeDate(encoded);
      assert.strictEqual(decoded.toISOString(), leapDay.toISOString());
    });

    test("should encode format with date separators", () => {
      const date = new Date("2024-11-23T16:02:27.123Z");
      const encoded = encodeDate(date);

      // Check that the encoded string contains the expected separators (c for :, d for .)
      assert.ok(encoded.includes("c"), "Should contain 'c' separator for time");
      assert.ok(encoded.includes("d"), "Should contain 'd' separator for milliseconds");
    });
  });

  describe("encoding maps", () => {
    test("should encode an empty message", () => {
      const result = encodeMap({});
      assert.strictEqual(result, "-IAA");
    });

    test("should encode single decimal field value", () => {
      const result = encodeMap({ a: 1 });
      assert.strictEqual(result, "-IAD0J_a6HABAAA1");
    });

    test("should encode boolean field value", () => {
      const result = encodeMap({ a: true, b: false });
      assert.strictEqual(result, "-IAE0J_a1AAM0J_b1AAL");
    });

    test("should encode nested field value", () => {
      const result = encodeMap({ a: { b: false } });
      assert.strictEqual(result, "-IAE0J_a-IAC0J_b1AAL");
    });

    test("should encode string field value", () => {
      const result = encodeMap({ a: "foobar" });
      assert.strictEqual(result, "-IAE0J_a5AACAAfoobar");
    });

    test("should encode multiple decimal fields", () => {
      const result = encodeMap({
        a: 1,
        b: 1.1,
      });

      assert.strictEqual(result, ["-IAG", "0J_a", "6HABAAA1", "0J_b", "4HABA1p1"].join(""));
    });

    test("should encode single decimal field with decimal", () => {
      const result = encodeMap({
        a: 1.1,
      });

      assert.strictEqual(result, "-IAD0J_a4HABA1p1");
    });
  });

  describe("encoding counters", () => {
    test("should encode counter", () => {
      const result = encodeCounter({
        code: CountCode_10.AttachmentGroup,
        count: 1234,
      });

      assert.strictEqual(result, "-VTS");
    });

    test("should encode counter of 64**2 - 1", () => {
      const result = encodeCounter({
        code: CountCode_10.AttachmentGroup,
        count: 64 ** 2 - 1,
      });

      assert.strictEqual(result, "-V__");
    });

    test("should encode large counter", () => {
      const result = encodeCounter({
        code: CountCode_10.AttachmentGroup,
        count: 123456789,
      });

      assert.strictEqual(result, "--VHW80V");
    });

    test("should decode small counter", () => {
      const reuslt = decodeCounter("-VTS");
      assert.strictEqual(reuslt.code, CountCode_10.AttachmentGroup);
      assert.strictEqual(reuslt.count, 1234);
      assert.strictEqual(reuslt.text, "-VTS");
    });

    test("should decode large counter", () => {
      const reuslt = decodeCounter("--VHW80V");
      assert.strictEqual(reuslt.code, CountCode_10.AttachmentGroup);
      assert.strictEqual(reuslt.count, 123456789);
      assert.strictEqual(reuslt.text, "--VHW80V");
    });
  });

  describe("encoding genus", () => {
    test("should encode genus with major and minor", () => {
      const result = encodeGenus({ genus: "AAA", major: 3, minor: 1239 });
      assert.strictEqual(result, `${CountCode_20.KERIACDCGenusVersion}DTX`);
    });

    test("should encode genus without minor", () => {
      const result = encodeGenus({ genus: "AAA", major: 3 });
      assert.strictEqual(result, `${CountCode_20.KERIACDCGenusVersion}DAA`);
    });

    test("should decode genus", () => {
      const result = decodeGenus(`${CountCode_20.KERIACDCGenusVersion}DTX`);
      assert.deepEqual(result, { genus: "AAA", major: 3, minor: 1239 });
    });
  });
});
