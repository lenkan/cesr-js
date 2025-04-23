import { test } from "node:test";
import assert from "node:assert";
import { Buffer } from "node:buffer";
import { encode, decode } from "./cesr-encoding.ts";
import vectors from "../fixtures/cesr_test_vectors.json" with { type: "json" };
import { CounterSize_10, CounterSize_20, IndexerSize, MatterSize } from "./codes.ts";
import { decodeBase64Int } from "./base64.ts";

for (const vector of vectors) {
  switch (vector.type) {
    case "matter": {
      test(`decode qb64 ${vector.type} ${vector.name} - ${vector.qb64.substring(0, 10)}`, () => {
        const result = decode(vector.qb64, MatterSize);
        const raw = Uint8Array.from(Buffer.from(vector.raw as string, "hex"));

        assert(result.frame);
        assert.deepEqual(result.frame.code, vector.code);
        assert.deepEqual(result.frame.text, vector.qb64);
        assert.deepEqual(result.frame.raw, raw);
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
        const result = decode(vector.qb64, IndexerSize);
        const raw = Uint8Array.from(Buffer.from(vector.raw as string, "hex"));

        assert(result.frame);
        assert.deepEqual(result.frame.code, vector.code);
        assert.deepEqual(result.frame.text, vector.qb64);
        assert.deepEqual(result.frame.raw, raw);
      });

      break;
    }
    case "counter_10": {
      test(`decode qb64 ${vector.type} ${vector.name} - ${vector.qb64.substring(0, 10)}`, () => {
        const result = decode(vector.qb64, CounterSize_10);

        assert(result.frame);
        assert.strictEqual(result.frame.code, vector.code);
        assert.strictEqual(result.frame.text, vector.qb64);
        assert.strictEqual(decodeBase64Int(result.frame.soft), vector.count);
        assert.strictEqual(result.frame.count, vector.count);
      });

      break;
    }
    case "counter_20": {
      test(`decode qb64 ${vector.type} ${vector.name} - ${vector.qb64.substring(0, 10)}`, () => {
        const result = decode(vector.qb64, CounterSize_20);

        assert(result.frame);
        assert.deepEqual(result.frame.code, vector.code);
        assert.deepEqual(result.frame.text, vector.qb64);
        assert.strictEqual(decodeBase64Int(result.frame.soft), vector.count);
        assert.strictEqual(result.frame.count, vector.count);
      });

      break;
    }
  }
}
