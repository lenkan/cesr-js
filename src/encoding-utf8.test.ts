import { basename } from "node:path";
import { describe, test } from "node:test";
import assert from "node:assert";
import { encodeUtf8, decodeUtf8 } from "./encoding-utf8.ts";

describe(basename(import.meta.url), () => {
  describe("encodeUtf8", () => {
    test("should encode text to UTF-8 bytes", () => {
      const result = encodeUtf8("Hello");
      assert.deepStrictEqual(result, Uint8Array.from([72, 101, 108, 108, 111]));
    });

    test("should encode unicode characters", () => {
      const result = encodeUtf8("🎉");
      assert.deepStrictEqual(result, Uint8Array.from([240, 159, 142, 137]));
    });
  });

  describe("decodeUtf8", () => {
    test("should decode UTF-8 bytes to text", () => {
      const bytes = Uint8Array.from([72, 101, 108, 108, 111]);
      const result = decodeUtf8(bytes);
      assert.strictEqual(result, "Hello");
    });

    test("should decode unicode bytes", () => {
      const bytes = Uint8Array.from([240, 159, 142, 137]);
      const result = decodeUtf8(bytes);
      assert.strictEqual(result, "🎉");
    });
  });
});
