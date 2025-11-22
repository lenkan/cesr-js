import { basename } from "node:path";
import { describe, test } from "node:test";
import assert from "node:assert";
import { concat, prepad, toArray } from "./array-utils.ts";

describe(basename(import.meta.url), () => {
  describe("concat", () => {
    test("should concatenate two non-empty arrays", () => {
      const a = Uint8Array.from([1, 2, 3]);
      const b = Uint8Array.from([4, 5, 6]);
      const result = concat(a, b);

      assert.deepStrictEqual(result, Uint8Array.from([1, 2, 3, 4, 5, 6]));
    });

    test("should return second array when first is empty", () => {
      const a = new Uint8Array(0);
      const b = Uint8Array.from([1, 2, 3]);
      const result = concat(a, b);

      assert.strictEqual(result, b);
      assert.deepStrictEqual(result, Uint8Array.from([1, 2, 3]));
    });

    test("should return first array when second is empty", () => {
      const a = Uint8Array.from([1, 2, 3]);
      const b = new Uint8Array(0);
      const result = concat(a, b);

      assert.strictEqual(result, a);
      assert.deepStrictEqual(result, Uint8Array.from([1, 2, 3]));
    });

    test("should handle both arrays empty", () => {
      const a = new Uint8Array(0);
      const b = new Uint8Array(0);
      const result = concat(a, b);

      assert.strictEqual(result, b);
      assert.strictEqual(result.length, 0);
    });

    test("should not modify original arrays", () => {
      const a = Uint8Array.from([1, 2]);
      const b = Uint8Array.from([3, 4]);
      const aCopy = Uint8Array.from(a);
      const bCopy = Uint8Array.from(b);

      concat(a, b);

      assert.deepStrictEqual(a, aCopy);
      assert.deepStrictEqual(b, bCopy);
    });

    test("should handle single byte arrays", () => {
      const a = Uint8Array.from([255]);
      const b = Uint8Array.from([0]);
      const result = concat(a, b);

      assert.deepStrictEqual(result, Uint8Array.from([255, 0]));
    });

    test("should handle large arrays", () => {
      const a = new Uint8Array(1000).fill(1);
      const b = new Uint8Array(1000).fill(2);
      const result = concat(a, b);

      assert.strictEqual(result.length, 2000);
      assert.strictEqual(result[0], 1);
      assert.strictEqual(result[999], 1);
      assert.strictEqual(result[1000], 2);
      assert.strictEqual(result[1999], 2);
    });
  });

  describe("prepad", () => {
    test("should prepad array with zeros", () => {
      const raw = Uint8Array.from([1, 2, 3]);
      const result = prepad(raw, 2);

      assert.deepStrictEqual(result, Uint8Array.from([0, 0, 1, 2, 3]));
    });

    test("should return same array when raw.byteLength equals length", () => {
      const raw = Uint8Array.from([1, 2, 3]);
      const result = prepad(raw, 3);

      assert.strictEqual(result, raw);
      assert.deepStrictEqual(result, Uint8Array.from([1, 2, 3]));
    });

    test("should handle empty array with padding", () => {
      const raw = new Uint8Array(0);
      const result = prepad(raw, 3);

      assert.deepStrictEqual(result, Uint8Array.from([0, 0, 0]));
    });

    test("should prepad when raw.byteLength differs from length", () => {
      const raw = Uint8Array.from([255]);
      const result = prepad(raw, 2);

      assert.deepStrictEqual(result, Uint8Array.from([0, 0, 255]));
    });

    test("should not modify original array", () => {
      const raw = Uint8Array.from([1, 2, 3]);
      const copy = Uint8Array.from(raw);

      prepad(raw, 2);

      assert.deepStrictEqual(raw, copy);
    });

    test("should handle large padding", () => {
      const raw = Uint8Array.from([1]);
      const result = prepad(raw, 100);

      assert.strictEqual(result.length, 101);
      assert.strictEqual(result[0], 0);
      assert.strictEqual(result[99], 0);
      assert.strictEqual(result[100], 1);
    });
  });

  describe("toArray", () => {
    test("should convert number to byte array", () => {
      const result = toArray(258, 2);
      assert.deepStrictEqual(result, Uint8Array.from([1, 2]));
    });

    test("should convert 0 to byte array", () => {
      const result = toArray(0, 2);
      assert.deepStrictEqual(result, Uint8Array.from([0, 0]));
    });

    test("should convert single byte number", () => {
      const result = toArray(255, 1);
      assert.deepStrictEqual(result, Uint8Array.from([255]));
    });

    test("should handle 3-byte number", () => {
      const result = toArray(0x123456, 3);
      assert.deepStrictEqual(result, Uint8Array.from([0x12, 0x34, 0x56]));
    });

    test("should handle 4-byte number", () => {
      const result = toArray(0x12345678, 4);
      assert.deepStrictEqual(result, Uint8Array.from([0x12, 0x34, 0x56, 0x78]));
    });

    test("should pad with zeros if number is smaller than length", () => {
      const result = toArray(1, 4);
      assert.deepStrictEqual(result, Uint8Array.from([0, 0, 0, 1]));
    });

    test("should handle maximum single byte value", () => {
      const result = toArray(255, 1);
      assert.deepStrictEqual(result, Uint8Array.from([255]));
    });

    test("should handle maximum two byte value", () => {
      const result = toArray(65535, 2);
      assert.deepStrictEqual(result, Uint8Array.from([255, 255]));
    });

    test("should truncate if number exceeds byte length capacity", () => {
      const result = toArray(256, 1);
      assert.deepStrictEqual(result, Uint8Array.from([0]));
    });

    test("should handle zero length array", () => {
      const result = toArray(123, 0);
      assert.deepStrictEqual(result, new Uint8Array(0));
    });

    test("should handle large numbers", () => {
      const result = toArray(16777215, 3); // 0xFFFFFF
      assert.deepStrictEqual(result, Uint8Array.from([255, 255, 255]));
    });
  });
});
