import assert from "node:assert";
import { basename } from "node:path";
import test, { describe } from "node:test";
import { Matter } from "./matter.ts";
import { inspect } from "node:util";

describe(basename(import.meta.url), () => {
  describe("encoding matter primitives", () => {
    test("should throw if raw does not have enough bytes", () => {
      // TODO: Throw on construction
      const matter = Matter.crypto.ed25519_sig(new Uint8Array(63));

      assert.throws(() => {
        matter.text();
      }, new Error("Encoded size 86 does not match expected size 88"));
    });

    test("should encode fixed size primitive", () => {
      const matter = Matter.crypto.blake3_256(new Uint8Array(32));
      const result = matter.text();
      assert.strictEqual(result, `E${"A".repeat(43)}`);
      assert.strictEqual(matter.quadlets, 11);
    });

    test("should encode 2 char code fixed size primitive", () => {
      const matter = Matter.crypto.ed25519_sig(new Uint8Array(64));

      const result = matter.text();

      assert.strictEqual(result, `0B${"A".repeat(86)}`);
      assert.strictEqual(matter.quadlets, 22);
    });

    test("should encode small string lead 0", () => {
      const matter = Matter.primitive.string("fo!");

      const text = matter.text();

      assert.strictEqual(text.length % 4, 0);
      assert.strictEqual(text, "4BABZm8h");
      assert.strictEqual(matter.quadlets, 2);
    });

    test("should encode small string lead 1", () => {
      const matter = Matter.primitive.string("fooo!");

      const text = matter.text();

      assert.strictEqual(text.length % 4, 0);
      assert.strictEqual(text, "5BACAGZvb28h");
      assert.strictEqual(matter.quadlets, 3);
    });

    test("should encode small string lead 2", () => {
      const matter = Matter.primitive.string("fooooo!");

      const text = matter.text();

      assert.strictEqual(text.length % 4, 0);
      assert.strictEqual(text, "6BADAABmb29vb28h");
    });
  });

  describe("encode tags", () => {
    test("should encode single character tag", () => {
      const matter = Matter.primitive.tag("a");

      const text = matter.text();

      assert.strictEqual(text, "0J_a");
    });
  });

  describe("encoding numbers", () => {
    test("should encode 0", () => {
      assert.strictEqual(Matter.primitive.decimal(0).text(), "6HABAAA0");
    });

    test("should encode -0", () => {
      assert.strictEqual(Matter.primitive.decimal(-0).text(), "6HABAAA0");
    });

    test("should encode 0.1", () => {
      assert.strictEqual(Matter.primitive.decimal(0.1).text(), "4HABA0p1");
    });

    test("should encode 1", () => {
      assert.strictEqual(Matter.primitive.decimal(1).text(), "6HABAAA1");
    });

    test("should encode 123", () => {
      assert.strictEqual(Matter.primitive.decimal(123).text(), "4HABA123");
    });

    test("should encode 1.1", () => {
      assert.strictEqual(Matter.primitive.decimal(1.1).text(), "4HABA1p1");
    });

    test("should encode -1.1", () => {
      assert.strictEqual(Matter.primitive.decimal(-1.1).text(), "4HAB-1p1");
    });

    test("should encode 12345678", () => {
      assert.strictEqual(Matter.primitive.decimal(12345678).text(), "4HAC12345678");
    });

    test("should encode MAX_SAFE_INTEGER", () => {
      assert.strictEqual(Matter.primitive.decimal(Number.MAX_SAFE_INTEGER).text(), "4HAE9007199254740991");
    });
  });

  describe("encode/decode hex numbers", () => {
    test("should encode/decode 0x00", () => {
      const matter = Matter.primitive.hex("0");

      assert.strictEqual(matter.text(), "0A" + "A".repeat(22));
      assert.strictEqual(matter.as.hex(), "0");
    });

    test("should encode/decode single digit number", () => {
      const matter = Matter.primitive.hex("2");
      assert.strictEqual(matter.text(), "0A" + "A".repeat(21) + "C");
      assert.strictEqual(matter.text().length, 24);
      assert.strictEqual(matter.as.hex(), "2");
    });

    test("should encode/decode hex number", () => {
      const matter = Matter.primitive.hex("32");
      assert.strictEqual(matter.text(), "0A" + "A".repeat(21) + "y");
      assert.strictEqual(matter.text().length, 24);
      assert.strictEqual(matter.as.hex(), "32");
    });

    test("should encode/decode large hex number", () => {
      const hex = "1234567890abcdef1234567890abcdef";
      const matter = Matter.primitive.hex(hex);

      assert.strictEqual(matter.text(), "0A" + "ASNFZ4kKvN7xI0VniQq83v");
      assert.strictEqual(matter.as.hex(), hex);
    });
  });

  describe("encoding strings", () => {
    test("should encode/decode 'abc'", () => {
      const value = "abc";
      const expected = "4AABAabc";
      const matter = Matter.primitive.string(value);
      assert.strictEqual(matter.text(), expected);
      assert.strictEqual(matter.as.string(), value);
    });

    test("should encode/decode large string", () => {
      const value = "a".repeat(100000);
      const matter = Matter.primitive.string(value);

      assert.match(matter.text(), /^7AAA/);
      assert.strictEqual(matter.text().length % 4, 0);
      assert.strictEqual(matter.as.string(), value);
    });

    test("should encode/decode 'Foobar'", () => {
      const value = "Foobar";
      const expected = "5AACAAFoobar";
      const matter = Matter.primitive.string(value);

      assert.strictEqual(matter.text(), expected);
      assert.strictEqual(matter.as.string(), value);
    });

    test("should encode/decode 'Foobars'", () => {
      const value = "Foobars";
      const expected = "4AACAFoobars";
      const matter = Matter.primitive.string(value);

      assert.strictEqual(matter.text(), expected);
      assert.strictEqual(matter.as.string(), value);
    });

    test("should encode/decode 'ABC' (non-base64)", () => {
      const value = "ABC";
      const expected = "4BABQUJD"; // Cannot start with A for base64
      const matter = Matter.primitive.string(value);

      assert.strictEqual(matter.text(), expected);
      assert.strictEqual(matter.as.string(), value);
    });

    test("should encode/decode 'Hello World!'", () => {
      const value = "Hello World!";
      const expected = "4BAESGVsbG8gV29ybGQh";
      const matter = Matter.primitive.string(value);

      assert.strictEqual(matter.text(), expected);
      assert.strictEqual(matter.as.string(), value);
    });

    test("should encode/decode 'Foobars!'", () => {
      const value = "Foobars!";
      const expected = "5BADAEZvb2JhcnMh";
      const matter = Matter.primitive.string(value);

      assert.strictEqual(matter.text(), expected);
      assert.strictEqual(matter.as.string(), value);
    });

    test("should encode/decode special characters", () => {
      const value = '$£!=)#)!(!#!=()#!()/()"#!/';
      const expected = "4BAJJMKjIT0pIykhKCEjIT0oKSMhKCkvKCkiIyEv";
      const matter = Matter.primitive.string(value);

      assert.strictEqual(matter.text(), expected);
      assert.strictEqual(matter.as.string(), value);
    });

    test("should encode/decode path '-a-b-c'", () => {
      const value = "-a-b-c";
      const expected = "5AACAA-a-b-c";
      const matter = Matter.primitive.string(value);

      assert.strictEqual(matter.text(), expected);
      assert.strictEqual(matter.as.string(), value);
    });

    test("should encode/decode path '-a-abc'", () => {
      const value = "-a-abc";
      const expected = "5AACAA-a-abc";
      const matter = Matter.primitive.string(value);

      assert.strictEqual(matter.text(), expected);
      assert.strictEqual(matter.as.string(), value);
    });

    test("should encode/decode path '-a-abcdef'", () => {
      const value = "-a-abcdef";
      const expected = "6AADAAA-a-abcdef";
      const matter = Matter.primitive.string(value);

      assert.strictEqual(matter.text(), expected);
      assert.strictEqual(matter.as.string(), value);
    });

    test("should encode/decode path '-A-ABC-c'", () => {
      const value = "-A-ABC-c";
      const expected = "4AAC-A-ABC-c";
      const matter = Matter.primitive.string(value);

      assert.strictEqual(matter.text(), expected);
      assert.strictEqual(matter.as.string(), value);
    });
  });

  describe("encoding dates", () => {
    test("should encode CESR date format", () => {
      const matter = Matter.primitive.date(new Date(Date.parse("2024-11-23T16:02:27.123Z")));
      assert.strictEqual(matter.text(), "1AAG2024-11-23T16c02c27d123000p00c00");
    });

    test("should decode an encoded date", () => {
      const original = new Date("2024-11-23T16:02:27.123Z");
      const matter = Matter.primitive.date(original);
      const decoded = matter.as.date();
      assert.strictEqual(decoded.toISOString(), original.toISOString());
    });

    test("should handle dates with zero milliseconds", () => {
      const date = new Date("2024-01-15T10:30:45.000Z");
      const matter = Matter.primitive.date(date);
      const decoded = matter.as.date();

      assert.strict(matter.text(), "1AAG2024-01-15T10c30c45d000000p00c00");
      assert.strictEqual(decoded.toISOString(), date.toISOString());
    });

    test("should preserve UTC time correctly", () => {
      const date = new Date("2024-07-04T14:30:15.456Z");
      const matter = Matter.primitive.date(date);

      const decoded = matter.as.date();

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
        Matter.primitive.date(invalidDate);
      }, /Invalid date/);
    });

    test("should round-trip multiple times consistently", () => {
      const original = new Date("2024-03-21T08:15:30.789Z");

      // Encode and decode multiple times
      let current = original;
      for (let i = 0; i < 3; i++) {
        const encoded = Matter.primitive.date(current);
        current = encoded.as.date();
      }

      assert.strictEqual(current.toISOString(), original.toISOString());
    });

    test("should handle leap year date", () => {
      const leapDay = new Date("2024-02-29T12:00:00.000Z"); // 2024 is a leap year
      const matter = Matter.primitive.date(leapDay);

      const decoded = matter.as.date();

      assert.strictEqual(decoded.toISOString(), leapDay.toISOString());
    });
  });

  describe("inspect", () => {
    test("should display code and raw", () => {
      const matter = Matter.crypto.blake3_256(new Uint8Array(32));
      assert.deepStrictEqual(inspect(matter, { colors: false }).split("\n"), [
        `Matter {`,
        `  code: '${matter.code}',`,
        "  soft: undefined,",
        "  raw: Uint8Array(32) [",
        `    0, 0, 0, 0, 0, 0, 0, 0, 0,`,
        `    0, 0, 0, 0, 0, 0, 0, 0, 0,`,
        `    0, 0, 0, 0, 0, 0, 0, 0, 0,`,
        `    0, 0, 0, 0, 0`,
        `  ]`,
        `}`,
      ]);
    });
  });
});
