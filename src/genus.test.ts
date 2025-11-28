import test, { describe } from "node:test";
import { basename } from "node:path";
import { Genus } from "./genus.ts";
import assert from "node:assert";

describe(basename(import.meta.url), () => {
  test("should encode genus with major and minor", () => {
    const result = new Genus({ protocol: "AAA", major: 3, minor: 1239 });

    assert.strictEqual(result.text(), `-_AAADTX`);
    assert.deepStrictEqual(result.binary(), new Uint8Array([251, 240, 0, 0, 52, 215]));
  });

  test("should encode genus without minor", () => {
    const result = new Genus({ protocol: "AAA", major: 3 });

    assert.strictEqual(result.text(), `-_AAADAA`);
    assert.deepStrictEqual(result.binary(), new Uint8Array([251, 240, 0, 0, 48, 0]));
  });

  test("should parse genus", () => {
    const result = Genus.parse(`-_AAADTX`);

    assert.partialDeepStrictEqual(result, { protocol: "AAA", major: 3, minor: 1239 });
    assert.strictEqual(result.text(), `-_AAADTX`);
  });

  test("should have KERIACDC_10 genus", () => {
    const result = Genus.KERIACDC_10;

    assert.partialDeepStrictEqual(result, { protocol: "AAA", major: 1, minor: 0 });
    assert.strictEqual(result.text(), `-_AAABAA`);
  });

  test("should have KERIACDC_20 genus", () => {
    const result = Genus.KERIACDC_20;

    assert.partialDeepStrictEqual(result, { protocol: "AAA", major: 2, minor: 0 });
    assert.strictEqual(result.text(), `-_AAACAA`);
  });
});
