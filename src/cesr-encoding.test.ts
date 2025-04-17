import { describe, test } from "node:test";
import assert from "node:assert";
import { Buffer } from "node:buffer";
import { decode, encodeDate, encodeText } from "./cesr-encoding.ts";
import { CounterSize_10, MatterSize } from "./codes.ts";

function encodeUtf8(input: string) {
  return new TextEncoder().encode(input);
}

test("cesr date", () => {
  const result = encodeDate(new Date(Date.parse("2024-11-23T16:02:27.123Z")));
  assert.strictEqual(result, "1AAG2024-11-23T16c02c27d123000p00c00");
});

test("CESR string", () => {
  const raw = Buffer.from("1484ea1b126350b4e36f16750a2a30fb85a04d5965", "hex");
  const result = encodeText("7AAA", raw);

  assert.strictEqual(result, "7AAAAAAHFITqGxJjULTjbxZ1Ciow-4WgTVll");
});

test("CESR decode attachment group", () => {
  const input = encodeUtf8("-VAnABC");
  const result = decode(input, CounterSize_10);

  assert.deepStrictEqual(result.frame, {
    type: "counter_10",
    code: "-V",
    soft: "An",
    text: "-VAn",
  });
});

test("CESR decode controller sigs", () => {
  const input = [
    "-VAi",
    "-CAB",
    "BILZrnru0e-0MUmnnjOdWTrZ7OW3sCuk_C_67uYeLsN_",
    "0BBqX3eR8hNURYuokP3gfJDpcSC41UfFmp2NpTlt4kXwSFR40TXzMll0qtgntwS96U8M2JjTtV_-Ffl5FaGunpEJ",
  ].join("");

  const result = decode(input, CounterSize_10);

  assert.partialDeepStrictEqual(result.frame, {
    type: "counter_10",
    code: "-V",
    text: "-VAi",
  });
  assert.deepStrictEqual(result.n, 4);
});

test("CESR decode", () => {
  const input = "7AAAAAAHFITqGxJjULTjbxZ1Ciow-4WgTVll";
  const result = decode(input, MatterSize);

  assert.partialDeepStrictEqual(result.frame, {
    type: "matter",
    code: "7AAA",
    text: input,
  });

  assert.strictEqual(result.n, 36);
});

describe("CESR Decode salt", () => {
  test("Decode salt", () => {
    const result0 = decode("0ACSTo66vU2CA-j4usUIAEm2");
    assert.deepStrictEqual(
      result0.raw,
      new Uint8Array([146, 78, 142, 186, 189, 77, 130, 3, 232, 248, 186, 197, 8, 0, 73, 182]),
    );
  });
});
