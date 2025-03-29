import { test } from "node:test";
import assert from "node:assert";
import cesr from "./cesr-encoding.ts";

test("cesr date", () => {
  const result = cesr.encodeDate(new Date(Date.parse("2024-11-23T16:02:27.123Z")));
  assert.strictEqual(result, "1AAG2024-11-23T16c02c27d123000p00c00");
});
