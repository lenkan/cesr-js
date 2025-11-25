import test, { describe } from "node:test";
import assert from "node:assert";
import vectors from "../fixtures/cesr_test_vectors.json" with { type: "json" };
import path from "node:path";
import { Matter } from "../src/matter.ts";

describe(path.parse(import.meta.url).base, () => {
  for (const entry of vectors.filter((v) => v.type === "matter")) {
    test(`Encode ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));
      const binary = Uint8Array.from(Buffer.from(entry.qb2 as string, "hex"));

      const frame = Matter.from(entry.code, raw);

      assert.deepEqual(frame.code, entry.code);
      assert.deepEqual(frame.raw, raw);
      assert.deepEqual(frame.text(), entry.qb64);
      assert.deepEqual(frame.binary(), binary);
    });

    test(`Decode ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)} - text`, () => {
      const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));
      const binary = Uint8Array.from(Buffer.from(entry.qb2 as string, "hex"));

      const frame = Matter.parse(entry.qb64);

      assert.deepEqual(frame.code, entry.code);
      assert.deepEqual(frame.raw, raw);
      assert.deepEqual(frame.text(), entry.qb64);
      assert.deepEqual(frame.binary(), binary);
    });
  }
});
