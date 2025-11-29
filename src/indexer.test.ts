import test, { describe } from "node:test";
import { basename } from "node:path";
import assert from "node:assert";
import { Indexer } from "./indexer.ts";
import { inspect } from "node:util";

describe(basename(import.meta.url), () => {
  describe("inspect", () => {
    test("should display code and raw", () => {
      const frame = Indexer.crypto.ed25519_sig(new Uint8Array(64), 32, 12);
      assert.deepStrictEqual(inspect(frame, { colors: false }).split("\n"), [
        `Indexer {`,
        `  code: '${frame.code}',`,
        "  soft: 32,",
        "  other: 12,",
        "  raw: Uint8Array(64) [",
        `    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,`,
        `    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,`,
        `    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,`,
        `    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,`,
        `    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,`,
        `    0, 0, 0, 0`,
        `  ]`,
        `}`,
      ]);
    });
  });
});
