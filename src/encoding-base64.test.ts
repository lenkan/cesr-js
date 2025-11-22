import { basename } from "node:path";
import { describe, test } from "node:test";
import assert from "node:assert";
import { decodeBase64Int, decodeBase64Url, encodeBase64Int, encodeBase64Url } from "./encoding-base64.ts";

describe(basename(import.meta.url), () => {
  describe("base64 integer encoding", () => {
    test("should encode integers to base64", () => {
      assert.strictEqual(encodeBase64Int(0), "A");
      assert.strictEqual(encodeBase64Int(1), "B");
      assert.strictEqual(encodeBase64Int(1, 2), "AB");
      assert.strictEqual(encodeBase64Int(1, 3), "AAB");
    });

    test("should throw for value exceeding length capacity", () => {
      assert.throws(() => {
        encodeBase64Int(64, 1);
      }, new Error(`value 64 too big for base64 length 1`));
    });

    test("should decode base64 to integers", () => {
      assert.strictEqual(decodeBase64Int("A"), 0);
      assert.strictEqual(decodeBase64Int("AB"), 1);
      assert.strictEqual(decodeBase64Int("B"), 1);
      assert.strictEqual(decodeBase64Int("BA"), 64);
      assert.strictEqual(decodeBase64Int("An"), 39);
      assert.strictEqual(decodeBase64Int("A-"), 62);
      assert.strictEqual(decodeBase64Int("A_"), 63);
      assert.strictEqual(decodeBase64Int("__"), (63 << 6) + 63);
    });
  });

  describe("base64url encoding", () => {
    test("should encode bytes to base64url", () => {
      assert.strictEqual(encodeBase64Url(Uint8Array.from([0, 1, 2])), "AAEC");
      assert.strictEqual(encodeBase64Url(Uint8Array.from([99, 1, 2])), "YwEC");
      assert.strictEqual(encodeBase64Url(Uint8Array.from([99, 1, 99])), "YwFj");
      assert.strictEqual(encodeBase64Url(Uint8Array.from([99, 1, 99, 99, 231])), "YwFjY-c");
    });

    test("should decode base64url to bytes", () => {
      assert.deepEqual(decodeBase64Url("AAEC"), Uint8Array.from([0, 1, 2]));
      assert.deepEqual(decodeBase64Url("YwEC"), Uint8Array.from([99, 1, 2]));
      assert.deepEqual(decodeBase64Url("YwE"), Uint8Array.from([0x63, 1]));
      assert.deepEqual(decodeBase64Url("YwFj"), Uint8Array.from([99, 1, 99]));
      assert.deepEqual(decodeBase64Url("YwFjY-d"), Uint8Array.from([99, 1, 99, 99, 231]));
      assert.deepEqual(decodeBase64Url("A"), Uint8Array.from([]));
      assert.deepEqual(decodeBase64Url("AA"), Uint8Array.from([0]));
      assert.deepEqual(decodeBase64Url("AAA"), Uint8Array.from([0, 0]));
      assert.deepEqual(decodeBase64Url("AAAA"), Uint8Array.from([0, 0, 0]));
      assert.deepEqual(decodeBase64Url("AAAAB"), Uint8Array.from([0, 0, 0]));
      assert.deepEqual(decodeBase64Url("AAAAAA"), Uint8Array.from([0, 0, 0, 0]));
    });
  });
});
