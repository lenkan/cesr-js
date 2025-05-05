import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { CounterV1, CounterV2 } from "./counter.ts";
import vectors from "../fixtures/cesr_test_vectors.json" with { type: "json" };

describe("Encode counter v1", () => {
  test("Encode attachment group", () => {
    const result = CounterV1.attachments(39);
    assert.equal(result.text, "-VAn");
  });

  test("Encode big attachment group", () => {
    const result = CounterV1.attachments(64 ** 2 + 1);
    assert.equal(result.text, "-0VAABAB");
  });
});

describe("Encode counter v2", () => {
  test("Encode attachment group", () => {
    const result = CounterV2.attachments(39);
    assert.equal(result.text, "-CAn");
  });

  test("Encode big attachment group", () => {
    const result = CounterV2.attachments(64 ** 2 + 1);
    assert.equal(result.text, "-0CAABAB");
  });
});

describe("Counter v1 test vector", () => {
  for (const entry of vectors.filter((v) => v.type === "counter_10")) {
    test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      const frame = CounterV1.decoder.decode(entry.qb64);

      assert.deepEqual(frame.code, entry.code);
      assert.deepEqual(frame.count, entry.count);
    });

    test(`encode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      assert(entry.count !== undefined);
      const frame = new CounterV1(entry);

      assert.deepEqual(frame.text, entry.qb64);
    });
  }
});

describe("Counter v1 test vector", () => {
  for (const entry of vectors.filter((v) => v.type === "counter_20")) {
    test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      const frame = CounterV2.decoder.decode(entry.qb64);

      assert.deepEqual(frame.code, entry.code);
      assert.deepEqual(frame.count, entry.count);
    });

    test(`encode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      assert(entry.count !== undefined);
      const frame = new CounterV2(entry);

      assert.deepEqual(frame.text, entry.qb64);
    });
  }
});
