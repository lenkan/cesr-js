import { test } from "node:test";
import assert from "node:assert";
import { Buffer } from "node:buffer";
import { decode, encodeDate, encode } from "./cesr-encoding.ts";
import { versify } from "./version.ts";

test("cesr date", () => {
  const result = encodeDate(new Date(Date.parse("2024-11-23T16:02:27.123Z")));
  assert.strictEqual(result, "1AAG2024-11-23T16c02c27d123000p00c00");
});

test("CESR string", () => {
  const raw = Buffer.from("1484ea1b126350b4e36f16750a2a30fb85a04d5965", "hex");
  const result = encode("7AAA", raw);

  console.log(raw);
  console.log(Buffer.from(new TextEncoder().encode(result.slice(8))));

  assert.strictEqual(result, "7AAAAAAHFITqGxJjULTjbxZ1Ciow-4WgTVll");
});

test("CESR decode", () => {
  const input = "7AAAAAAHFITqGxJjULTjbxZ1Ciow-4WgTVll";
  const result = decode(input);

  assert.deepStrictEqual(result, {
    type: "matter",
    code: "7AAA",
  });

  //   "code": "7AAA",
  //   "name": "StrB64_Big_L0",
  //   "raw": "1484ea1b126350b4e36f16750a2a30fb85a04d5965",
  //   "qb64": "7AAAAAAHFITqGxJjULTjbxZ1Ciow-4WgTVll",
  //   "qb2": "ec00000000071484ea1b126350b4e36f16750a2a30fb85a04d5965"
});

test("JSON string", () => {
  const raw = new TextEncoder().encode(JSON.stringify(versify({ t: "icp" })));
  const result = decode(raw);

  assert.deepStrictEqual(result, {
    type: "json",
    text: JSON.stringify({ v: "KERI10JSON000023_", t: "icp" }),
  });
});
