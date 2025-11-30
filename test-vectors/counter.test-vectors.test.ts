import test, { describe } from "node:test";
import assert from "node:assert";
import path from "node:path";
import { Buffer } from "node:buffer";
import vectors from "../fixtures/cesr_test_vectors.json" with { type: "json" };
import { Counter } from "../src/counter.ts";

describe(path.parse(import.meta.url).base, () => {
  for (const entry of vectors.filter((v) => v.type === "counter_10" || v.type === "counter_20")) {
    test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      const frame = Counter.parse(entry.qb64);

      assert.strictEqual(frame.code, entry.code);
      assert.strictEqual(frame.type, entry.code.replace(/^--?/, ""));
      assert.strictEqual(frame.count, entry.count);
    });

    test(`encode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));
      const binary = Uint8Array.from(Buffer.from(entry.qb2 as string, "hex"));

      const frame = new Counter({ type: entry.code.replace(/^-+/, ""), count: entry.count ?? 0 });

      assert.deepEqual(frame.code, entry.code);
      assert.deepEqual(frame.raw, raw);
      assert.deepEqual(frame.text(), entry.qb64);
      assert.deepEqual(frame.binary(), binary);
    });
  }
});
