import { test } from "node:test";
import assert from "node:assert";
import { Buffer } from "node:buffer";
import cesr from "./cesr-encoding.ts";
import vectors from "../fixtures/cesr_test_vectors.json" with { type: "json" };

for (const vector of vectors) {
  switch (vector.type) {
    case "matter": {
      test(`decode ${vector.name} - ${vector.qb64.substring(0, 10)}`, () => {
        const result = cesr.decode(vector.qb64);
        assert.deepEqual(result.code, vector.code);
        assert.deepEqual(result.buffer, Buffer.from(vector.raw as string, "hex"));
      });

      test(`encode ${vector.name} - ${vector.qb64.substring(0, 10)}`, () => {
        const raw = Buffer.from(vector.raw as string, "hex");
        const result = cesr.encode(vector.code, raw);
        assert.deepEqual(result, vector.qb64);
      });
      break;
    }
  }
}
