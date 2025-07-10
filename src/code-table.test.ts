import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { CodeTable } from "./code-table.ts";
import { MatterTable } from "./codes.ts";
import { decodeUtf8, encodeUtf8 } from "./encoding-utf8.ts";

const table = new CodeTable(MatterTable);

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
  const table = new CodeTable({});

  test("Should find small count code size", () => {
    const result = table.lookup("-V");
    assert.partialDeepStrictEqual(result, { hs: 2, ss: 2, fs: 4 });
  });

  test("Should find large count code size", () => {
    const result = table.lookup("--V");
    assert.partialDeepStrictEqual(result, { hs: 3, ss: 5, fs: 8 });
  });

  test("Should throw on op code", () => {
    assert.throws(() => table.lookup("_A"), new Error("Unknown code _A"));
  });

  test("Should throw on lookup code that is not in table", () => {
    assert.throws(() => table.lookup("7AAA"), new Error("Unknown code 7AAA"));
  });

  test("Should include at most 4 characters in error", () => {
    assert.throws(() => table.lookup("A".repeat(80)), new Error("Unknown code AAAA"));
  });
});

describe("Encoding", () => {
  const table = new CodeTable(MatterTable);

  describe("Encode fixed size primitive", () => {
    test("Should encode fixed size primitive", () => {
      const result = decodeUtf8(
        table.encode({
          code: "E",
          raw: new Uint8Array(32),
        }),
      );

      assert.equal(result, `E${"A".repeat(43)}`);
    });

    test("Should encode 2 char code fixed size primitive", () => {
      const result = decodeUtf8(
        table.encode({
          code: "0B",
          raw: new Uint8Array(64),
        }),
      );

      assert.equal(result, `0B${"A".repeat(86)}`);
    });
  });

  describe("Encode variable sizes primitives", () => {
    test("Should encode small variable size lead 0", () => {
      const text = decodeUtf8(
        table.encode({
          code: "4B",
          raw: encodeUtf8("foo"),
        }),
      );

      assert.equal(text.length % 4, 0);
      assert.equal(text, "4BABZm9v");
    });

    test("Should encode small variable size lead 1", () => {
      const text = decodeUtf8(
        table.encode({
          code: "5B",
          raw: encodeUtf8("foooo"),
        }),
      );

      assert.equal(text.length % 4, 0);
      assert.equal(text, "5BACAGZvb29v");
    });

    test("Should encode small variable size lead 2", () => {
      const text = decodeUtf8(
        table.encode({
          code: "6B",
          raw: encodeUtf8("fooo"),
        }),
      );

      assert.equal(text.length % 4, 0);
      assert.equal(text, "6BACAABmb29v");
    });
  });
});
