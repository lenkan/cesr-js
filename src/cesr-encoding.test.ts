import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { decode, encodeDate, encode } from "./cesr-encoding.ts";
import { CounterSize_10, MatterSize } from "./codes.ts";

test("cesr date", () => {
  const result = encodeDate(new Date(Date.parse("2024-11-23T16:02:27.123Z")));
  assert.equal(result, "1AAG2024-11-23T16c02c27d123000p00c00");
});

test("CESR string", () => {
  const raw = Buffer.from("1484ea1b126350b4e36f16750a2a30fb85a04d5965", "hex");
  const result = encode("7AAA", raw);

  assert.equal(result, "7AAAAAAHFITqGxJjULTjbxZ1Ciow-4WgTVll");
});

describe("decode", () => {
  test("decodes legacy JSON", () => {
    const input = '{"v":"KERI10JSON000023_","t":"icp"}';
    const result = decode(input);

    assert.partialDeepStrictEqual(result, {
      frame: {
        type: "message",
        code: "KERI",
        text: input,
      },
      n: 35,
    });
  });

  test("decodes JSON", () => {
    const input = '{"v":"KERICAAJSONAAAi.","t":"icp"}';
    const result = decode(input);

    assert.partialDeepStrictEqual(result, {
      frame: {
        type: "message",
        code: "KERI",
        text: input,
      },
      n: 34,
    });
  });

  test("decodes text variable size", () => {
    const input = "7AAAAAAHFITqGxJjULTjbxZ1Ciow-4WgTVll";
    const result = decode(input, MatterSize);

    assert.partialDeepStrictEqual(result, {
      frame: {
        type: "matter",
        code: "7AAA",
        text: input,
      },
      n: 36,
    });
  });

  test("decode raw salt", () => {
    const result0 = decode("0ACSTo66vU2CA-j4usUIAEm2");

    assert.partialDeepStrictEqual(result0, {
      frame: {
        raw: new Uint8Array([146, 78, 142, 186, 189, 77, 130, 3, 232, 248, 186, 197, 8, 0, 73, 182]),
      },
    });
  });

  test("decode count code", () => {
    const input = "-VAi";

    const result = decode(input, CounterSize_10);

    assert.partialDeepStrictEqual(result, {
      frame: {
        type: "counter_10",
        code: "-V",
        text: "-VAi",
      },
      n: 4,
    });
  });
});
