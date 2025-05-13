import { describe, test } from "node:test";
import { decodeVersion, encodeMessageBody, encodeMessageBodyV1 } from "./message.ts";
import assert from "node:assert";

describe("decode version string", () => {
  const encoder = new TextEncoder();

  test("Should parse legacy keri version", () => {
    const result = decodeVersion(encoder.encode(JSON.stringify({ v: "KERI10JSON00000a_" })));
    assert.deepStrictEqual(result, {
      protocol: "KERI",
      major: 1,
      minor: 0,
      format: "JSON",
      size: 10,
      legacy: true,
    });
  });

  test("Should parse keri version", () => {
    const result = decodeVersion(encoder.encode(JSON.stringify({ v: "KERICABJSONAAAB." })));
    assert.deepStrictEqual(result, {
      protocol: "KERI",
      major: 2,
      minor: 1,
      format: "JSON",
      size: 1,
    });
  });
});

describe("Encode v1 message body", () => {
  test("Should add legacy version to object", () => {
    const result = encodeMessageBodyV1({ a: 1 }, { protocol: "KERI", major: 1, minor: 0 });

    assert.deepStrictEqual(result, { v: "KERI10JSON00001f_", a: 1 });

    // Ensures that v is the first key, as per the spec
    assert.strictEqual(JSON.stringify(result), '{"v":"KERI10JSON00001f_","a":1}');
  });
});

describe("Encode v2 message body", () => {
  test("Should add version to object", () => {
    const result = encodeMessageBody({ a: 1 }, { protocol: "KERI", major: 1, minor: 0 });

    assert.deepStrictEqual(result, { v: "KERIBAAJSONAAAe.", a: 1 });

    // Ensures that v is the first key, as per the spec
    assert.strictEqual(JSON.stringify(result), '{"v":"KERIBAAJSONAAAe.","a":1}');
  });
});
