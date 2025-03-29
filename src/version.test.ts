import { describe, test } from "node:test";
import { parseVersion, versify } from "./version.ts";
import assert from "node:assert";

describe("Version parser", () => {
  const encoder = new TextEncoder();

  test("Should parse legacy keri version", () => {
    // PPPPvvKKKKllllll_
    const result = parseVersion(encoder.encode(JSON.stringify({ v: "KERI10JSON00000a_" })));
    assert.deepStrictEqual(result, {
      protocol: "KERI",
      version: "10",
      format: "JSON",
      size: 10,
    });
  });

  test("Should parse keri version", () => {
    // PPPPVVVKKKKBBBB.
    const result = parseVersion(encoder.encode(JSON.stringify({ v: "KERI201JSONAAAB." })));
    assert.deepStrictEqual(result, {
      protocol: "KERI",
      version: "201",
      format: "JSON",
      size: 1,
    });
  });
});

describe("Versify object", () => {
  test("Should add version to object", () => {
    const result = versify({ a: 1 });

    assert.deepStrictEqual(result, { v: "KERI10JSON00001f_", a: 1 });

    // Ensures that v is the first key, as per the spec
    assert.strictEqual(JSON.stringify(result), '{"v":"KERI10JSON00001f_","a":1}');
  });
});
