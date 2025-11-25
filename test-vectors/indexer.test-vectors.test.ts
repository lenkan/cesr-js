import test, { describe } from "node:test";
import assert from "node:assert";
import vectors from "../fixtures/cesr_test_vectors.json" with { type: "json" };
import path from "node:path";
import { Indexer } from "../src/indexer.ts";

describe(path.parse(import.meta.url).base, () => {
  for (const entry of vectors.filter((v) => v.type === "indexer")) {
    test(`Encode ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));
      const binary = Uint8Array.from(Buffer.from(entry.qb2 as string, "hex"));

      assert(entry.index !== null);
      const frame = Indexer.from(entry.code, raw, entry.index, entry.ondex ?? undefined);

      assert.deepEqual(frame.code, entry.code);
      assert.deepEqual(frame.raw, raw);
      assert.deepEqual(frame.index, entry.index);
      assert.deepEqual(frame.ondex, entry.ondex);
      assert.deepEqual(frame.text(), entry.qb64);
      assert.deepEqual(frame.binary(), binary);
    });

    test(`Decode ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)} - text`, () => {
      const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));
      const binary = Uint8Array.from(Buffer.from(entry.qb2 as string, "hex"));

      const frame = Indexer.parse(entry.qb64);

      assert.deepEqual(frame.code, entry.code);
      assert.deepEqual(frame.raw, raw);
      assert.deepEqual(frame.text(), entry.qb64);
      assert.deepEqual(frame.binary(), binary);
    });
  }
});
