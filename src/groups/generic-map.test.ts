import { basename } from "node:path";
import test, { describe } from "node:test";
import { GenericMapGroup } from "./generic-map.ts";
import assert from "node:assert";

describe(basename(import.meta.url), () => {
  test("should encode an empty message", () => {
    const map = new GenericMapGroup({});

    const result = map.text();

    assert.strictEqual(result, "-IAA");
  });

  test("should encode single decimal field value", () => {
    const map = new GenericMapGroup({ a: 1 });

    const result = map.text();

    assert.strictEqual(result, "-IAD0J_a6HABAAA1");
  });

  test("should encode boolean field value", () => {
    const map = new GenericMapGroup({ a: true, b: false });

    const result = map.text();

    assert.strictEqual(result, "-IAE0J_a1AAM0J_b1AAL");
  });

  test("should encode nested field value", () => {
    const map = new GenericMapGroup({ a: { b: false } });

    const result = map.text();

    assert.strictEqual(result, "-IAE0J_a-IAC0J_b1AAL");
  });

  test("should encode string field value", () => {
    const map = new GenericMapGroup({ a: "foobar" });

    const result = map.text();

    assert.strictEqual(result, "-IAE0J_a5AACAAfoobar");
  });

  test("should encode multiple decimal fields", () => {
    const map = new GenericMapGroup({
      a: 1,
      b: 1.1,
    });
    const result = map.text();

    assert.strictEqual(result, ["-IAG", "0J_a", "6HABAAA1", "0J_b", "4HABA1p1"].join(""));
  });

  test("should encode single decimal field with decimal", () => {
    const map = new GenericMapGroup({
      a: 1.1,
    });

    const result = map.text();

    assert.strictEqual(result, "-IAD0J_a4HABA1p1");
  });
});
