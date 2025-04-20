import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { decodeBase64Int, decodeBase64Url, encodeBase64Int, encodeBase64Url } from "./base64.ts";

describe("Base 64 int", () => {
  test("Create base 64 number", () => {
    assert.equal(encodeBase64Int(0), "A");
    assert.equal(encodeBase64Int(1), "B");
    assert.equal(encodeBase64Int(1, 2), "AB");
    assert.equal(encodeBase64Int(1, 3), "AAB");
  });

  test("Create too big number", () => {
    assert.throws(() => {
      encodeBase64Int(64, 1);
    }, new Error(`value 64 too big for base64 length 1`));
  });

  test("Parse base 64 number", () => {
    assert.equal(decodeBase64Int("A"), 0);
    assert.equal(decodeBase64Int("AB"), 1);
    assert.equal(decodeBase64Int("B"), 1);
    assert.equal(decodeBase64Int("BA"), 64);
    assert.equal(decodeBase64Int("An"), 39);
    assert.equal(decodeBase64Int("A-"), 62);
    assert.equal(decodeBase64Int("A_"), 63);
    assert.equal(decodeBase64Int("__"), (63 << 6) + 63);
  });
});

describe("Base 64 url", () => {
  test("Encode base64 url", () => {
    assert.equal(encodeBase64Url(Uint8Array.from([0, 1, 2])), "AAEC");
    assert.equal(encodeBase64Url(Uint8Array.from([99, 1, 2])), "YwEC");
    assert.equal(encodeBase64Url(Uint8Array.from([99, 1, 99])), "YwFj");
    assert.equal(encodeBase64Url(Uint8Array.from([99, 1, 99, 99, 231])), "YwFjY-c");
  });

  test("Decode base64 url", () => {
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
