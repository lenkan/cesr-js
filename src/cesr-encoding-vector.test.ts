import { test } from "node:test";
import assert from "node:assert";
import { Buffer } from "node:buffer";
import { encode } from "./cesr-encoding.ts";
import vectors from "../fixtures/cesr_test_vectors.json" with { type: "json" };
import { decodeBase64Int } from "./base64.ts";
import { decode } from "./parser.ts";

for (const vector of vectors) {
  switch (vector.type) {
    case "matter": {
      test(`decode qb64 ${vector.type} ${vector.name} - ${vector.qb64.substring(0, 10)}`, () => {
        const frame = decode(vector.qb64);
        const raw = Uint8Array.from(Buffer.from(vector.raw as string, "hex"));

        assert.deepEqual(frame.code, vector.code);
        assert.deepEqual(frame.text, vector.qb64);
        assert.deepEqual(frame.raw, raw);
      });

      test(`encode qb64 ${vector.type} ${vector.name} - ${vector.qb64.substring(0, 10)}`, () => {
        const raw = Buffer.from(vector.raw as string, "hex");
        const result = encode(vector.code, raw);
        assert.deepEqual(result, vector.qb64);
      });
      break;
    }
    case "indexer": {
      test(`decode qb64 ${vector.type} ${vector.name} - ${vector.qb64.substring(0, 10)}`, () => {
        const frame = decode(vector.qb64, { context: { type: "indexer", count: 1 } });
        const raw = Uint8Array.from(Buffer.from(vector.raw as string, "hex"));

        assert.deepEqual(frame.code, vector.code);
        assert.deepEqual(frame.text, vector.qb64);
        assert.deepEqual(frame.raw, raw);
      });

      break;
    }
    case "counter_10": {
      test(`decode qb64 ${vector.type} ${vector.name} - ${vector.qb64.substring(0, 10)}`, () => {
        const frame = decode(vector.qb64, {});

        assert.strictEqual(frame.code, vector.code);
        assert.strictEqual(frame.text, vector.qb64);
        assert(frame.soft);
        assert.strictEqual(decodeBase64Int(frame.soft), vector.count);
        assert.strictEqual(frame.count, vector.count);
      });

      break;
    }
    case "counter_20": {
      test(`decode qb64 ${vector.type} ${vector.name} - ${vector.qb64.substring(0, 10)}`, () => {
        const frame = decode(vector.qb64, { genus: { major: 2, protocol: "KERI" } });

        assert.deepEqual(frame.code, vector.code);
        assert.deepEqual(frame.text, vector.qb64);
        assert(frame.soft);
        assert.strictEqual(decodeBase64Int(frame.soft), vector.count);
        assert.strictEqual(frame.count, vector.count);
      });

      break;
    }
  }
}
