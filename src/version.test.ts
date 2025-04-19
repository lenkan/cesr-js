import { describe, test } from "node:test";
import { decodeVersion, versify } from "./version.ts";
import assert from "node:assert";

describe("Version parser", () => {
  const encoder = new TextEncoder();

  test("Should parse legacy keri version", () => {
    // PPPPvvKKKKllllll_
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
    // PPPPVVVKKKKBBBB.
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

describe("Versify object", () => {
  test("Should add legacy version to object", () => {
    const result = versify({ a: 1 }, true);

    assert.deepStrictEqual(result, { v: "KERI10JSON00001f_", a: 1 });

    // Ensures that v is the first key, as per the spec
    assert.strictEqual(JSON.stringify(result), '{"v":"KERI10JSON00001f_","a":1}');
  });

  test("Should add version to object", () => {
    const result = versify({ a: 1 });

    assert.deepStrictEqual(result, { v: "KERIBAAJSONAAAe.", a: 1 });

    // Ensures that v is the first key, as per the spec
    assert.strictEqual(JSON.stringify(result), '{"v":"KERIBAAJSONAAAe.","a":1}');
  });
});
