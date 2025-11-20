import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { CodeTable, lookupCounterSize } from "./code-table.ts";
import { MatterTableInit } from "./codes.ts";

const table = new CodeTable(MatterTableInit);

test("Should find small variable size", () => {
  const result0 = table.lookup("4A");
  const result1 = table.lookup("5A");
  const result2 = table.lookup("6A");

  assert.partialDeepStrictEqual(result0, { hs: 2, ss: 2, ls: 0 });
  assert.partialDeepStrictEqual(result1, { hs: 2, ss: 2, ls: 1 });
  assert.partialDeepStrictEqual(result2, { hs: 2, ss: 2, ls: 2 });
});

test("Should find large variable size", () => {
  const result0 = table.lookup("7AAA");
  const result1 = table.lookup("8AAA");
  const result2 = table.lookup("9AAA");

  assert.partialDeepStrictEqual(result0, { hs: 4, ss: 4, ls: 0 });
  assert.partialDeepStrictEqual(result1, { hs: 4, ss: 4, ls: 1 });
  assert.partialDeepStrictEqual(result2, { hs: 4, ss: 4, ls: 2 });
});

describe("When there are no primitives in table", () => {
  test("Should find small count code size", () => {
    const result = lookupCounterSize("-V");
    assert.partialDeepStrictEqual(result, { hs: 2, ss: 2, fs: 4 });
  });

  test("Should find large count code size", () => {
    const result = lookupCounterSize("--V");
    assert.partialDeepStrictEqual(result, { hs: 3, ss: 5, fs: 8 });
  });

  test("Should throw on op code", () => {
    assert.throws(() => lookupCounterSize("_A"), new Error("Unknown code _A"));
  });

  test("Should throw on lookup code that is not in table", () => {
    assert.throws(() => lookupCounterSize("7AAA"), new Error("Unknown code 7AAA"));
  });

  test("Should include at most 4 characters in error", () => {
    assert.throws(() => lookupCounterSize("A".repeat(80)), new Error("Unknown code AAAA"));
  });
});
