import { basename } from "node:path";
import test, { describe } from "node:test";
import { Counter } from "./counter.ts";
import assert from "node:assert";
import { inspect } from "node:util";

describe(basename(import.meta.url), () => {
  test("should encode counter", () => {
    const counter = Counter.v1.AttachmentGroup(1234);
    const text = counter.text();
    const binary = counter.binary();

    assert.strictEqual(text, "-VTS");
    assert.deepStrictEqual(binary, Uint8Array.from([249, 84, 210]));
  });

  test("should encode counter of 64**2 - 1", () => {
    const counter = Counter.v1.AttachmentGroup(64 ** 2 - 1);
    const text = counter.text();
    const binary = counter.binary();

    assert.strictEqual(text, "-V__");
    assert.deepStrictEqual(binary, Uint8Array.from([249, 95, 255]));
  });

  test("should encode large counter", () => {
    const counter = Counter.v1.AttachmentGroup(123456789);

    const text = counter.text();
    const binary = counter.binary();

    assert.strictEqual(text, "--VHW80V");
    assert.deepStrictEqual(binary, Uint8Array.from([251, 229, 71, 91, 205, 21]));
  });

  describe("parsing counters", () => {
    test("should parse small counter", () => {
      const counter = Counter.parse("-VTS");

      assert.strictEqual(counter.code, "-V");
      assert.strictEqual(counter.count, 1234);
      assert.strictEqual(counter.text(), "-VTS");
    });

    test("should parse large counter", () => {
      const counter = Counter.parse("--VHW80V");

      assert.strictEqual(counter.code, "--V");
      assert.strictEqual(counter.count, 123456789);
      assert.strictEqual(counter.text(), "--VHW80V");
    });

    test("should parse large that fits as a small counter", () => {
      const counter = Counter.parse("--VAAAAD");

      assert.strictEqual(counter.code, "-V");
      assert.strictEqual(counter.count, 3);
      assert.strictEqual(counter.text(), "-VAD");
    });
  });

  describe("inspect", () => {
    test("should display code and raw", () => {
      const counter = Counter.v1.ControllerIdxSigs(32);
      assert.deepStrictEqual(
        inspect(counter, { colors: false }),
        `Counter { code: '${counter.code}', soft: 32, raw: Uint8Array(0) [] }`,
      );
    });
  });
});
