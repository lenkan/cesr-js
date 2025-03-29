import { describe, test } from "node:test";
import assert from "node:assert";
import { decodeBase64Int, decodeBase64Url, encodeBase64Int, encodeBase64Url } from "./base64.ts";

describe("Base 64 int", () => {
  test("Create base 64 number", () => {
    assert.strictEqual(encodeBase64Int(0), "A");
    assert.strictEqual(encodeBase64Int(1), "B");
    assert.strictEqual(encodeBase64Int(1, 2), "AB");
  });

  test("Parse base 64 number", () => {
    assert.strictEqual(decodeBase64Int("A"), 0);
    assert.strictEqual(decodeBase64Int("AB"), 1);
    assert.strictEqual(decodeBase64Int("B"), 1);
    assert.strictEqual(decodeBase64Int("BA"), 64);
    assert.strictEqual(decodeBase64Int("An"), 39);
  });
});

describe("Base 64 url", () => {
  test("Encode base64 url", () => {
    assert.strictEqual(encodeBase64Url(Uint8Array.from([0, 1, 2])), "AAEC");
    assert.strictEqual(encodeBase64Url(Uint8Array.from([99, 1, 2])), "YwEC");
    assert.strictEqual(encodeBase64Url(Uint8Array.from([99, 1, 99])), "YwFj");
  });

  test("Decode base64 url", () => {
    assert.deepStrictEqual(decodeBase64Url("AAEC"), Uint8Array.from([0, 1, 2]));
    assert.deepStrictEqual(decodeBase64Url("YwEC"), Uint8Array.from([99, 1, 2]));
    assert.deepStrictEqual(decodeBase64Url("YwEC"), Uint8Array.from([99, 1, 2]));
    assert.deepStrictEqual(decodeBase64Url("YwFj"), Uint8Array.from([99, 1, 99]));
  });
});
