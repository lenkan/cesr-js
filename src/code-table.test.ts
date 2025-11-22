import { basename } from "node:path";
import { describe, test } from "node:test";
import assert from "node:assert";
import { CodeTable, lookupCounterSize } from "./code-table.ts";
import { MatterTableInit } from "./codes.ts";

describe(basename(import.meta.url), () => {
  const table = new CodeTable(MatterTableInit);

  describe("variable size lookup", () => {
    test("should find small variable size", () => {
      const result0 = table.lookup("4A");
      const result1 = table.lookup("5A");
      const result2 = table.lookup("6A");

      assert.partialDeepStrictEqual(result0, { hs: 2, ss: 2, ls: 0 });
      assert.partialDeepStrictEqual(result1, { hs: 2, ss: 2, ls: 1 });
      assert.partialDeepStrictEqual(result2, { hs: 2, ss: 2, ls: 2 });
    });

    test("should find large variable size", () => {
      const result0 = table.lookup("7AAA");
      const result1 = table.lookup("8AAA");
      const result2 = table.lookup("9AAA");

      assert.partialDeepStrictEqual(result0, { hs: 4, ss: 4, ls: 0 });
      assert.partialDeepStrictEqual(result1, { hs: 4, ss: 4, ls: 1 });
      assert.partialDeepStrictEqual(result2, { hs: 4, ss: 4, ls: 2 });
    });
  });

  describe("counter code lookup", () => {
    test("should find small count code size", () => {
      const result = lookupCounterSize("-V");
      assert.partialDeepStrictEqual(result, { hs: 2, ss: 2, fs: 4 });
    });

    test("should find large count code size", () => {
      const result = lookupCounterSize("--V");
      assert.partialDeepStrictEqual(result, { hs: 3, ss: 5, fs: 8 });
    });

    test("should throw on op code", () => {
      assert.throws(() => lookupCounterSize("_A"), new Error("Unknown code _A"));
    });

    test("should throw on lookup code that is not in table", () => {
      assert.throws(() => lookupCounterSize("7AAA"), new Error("Unknown code 7AAA"));
    });

    test("should include at most 4 characters in error", () => {
      assert.throws(() => lookupCounterSize("A".repeat(80)), new Error("Unknown code AAAA"));
    });
  });
});
