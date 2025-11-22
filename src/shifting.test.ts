import { basename } from "node:path";
import { describe, test } from "node:test";
import assert from "node:assert";
import { lshift } from "./shifting.ts";

describe(basename(import.meta.url), () => {
  describe("left shift operations", () => {
    test("should shift 2 << 1 => 4", () => {
      assert.strictEqual(lshift(2, 1), 4);
    });

    test("should shift 2 << 2 => 8", () => {
      assert.strictEqual(lshift(2, 2), 8);
    });

    test("should shift 259484760932357 << 0 => 259484760932357", () => {
      assert.strictEqual(lshift(259484760932357, 0), 259484760932357);
    });

    test("should shift 259484760932357 << 1 => 518969521864714", () => {
      assert.strictEqual(lshift(259484760932357, 1), 518969521864714);
    });
  });
});
