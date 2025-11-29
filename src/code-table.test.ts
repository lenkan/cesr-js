import { basename } from "node:path";
import { describe, test } from "node:test";
import assert from "node:assert";
import { CodeTable } from "./code-table.ts";
import { MatterTableInit } from "./codes.ts";

describe(basename(import.meta.url), () => {
  const table = new CodeTable(MatterTableInit);

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
