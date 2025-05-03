import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { decode, encodeDate, encode, encodeCounter, encodeIndexer } from "./cesr-encoding.ts";
import { CountCode_10, CounterSize_10, IndexCode, IndexerSize } from "./codes.ts";

test("cesr date", () => {
  const result = encodeDate(new Date(Date.parse("2024-11-23T16:02:27.123Z")));
  assert.equal(result, "1AAG2024-11-23T16c02c27d123000p00c00");
});

test("CESR string", () => {
  const raw = Buffer.from("1484ea1b126350b4e36f16750a2a30fb85a04d5965", "hex");
  const result = encode("7AAA", raw);

  assert.equal(result, "7AAAAAAHFITqGxJjULTjbxZ1Ciow-4WgTVll");
});

describe("Encode counter", () => {
  test("Encode attachment group", () => {
    const count = 39;
    const result = encodeCounter(CountCode_10.AttachmentGroup, count, CounterSize_10);
    assert.equal(result, "-VAn");
  });

  test("Encode big attachment group", () => {
    const count = 39;
    const result = encodeCounter(CountCode_10.BigAttachmentGroup, count, CounterSize_10);
    assert.equal(result, "-0VAAAAn");
  });
});

describe("Encode indexer", () => {
  test("Encode indexed signature", () => {
    const raw = Uint8Array.from(
      Buffer.from(
        "hLFzAwI4x0znVHkP_9jcH3liL11oeEhkIcsBS7KUHOq6uf8Rh9Kqa2Vo1F_Ai5Hlsvfc5AtvhBpPfYDIoUQrvA",
        "base64url",
      ),
    );

    const result = encodeIndexer(IndexCode.Ed25519_Sig, 3, raw, IndexerSize);
    assert.equal(result, "ADCEsXMDAjjHTOdUeQ__2NwfeWIvXWh4SGQhywFLspQc6rq5_xGH0qprZWjUX8CLkeWy99zkC2-EGk99gMihRCu8");

    const frame = decode(result, { context: { type: "indexer", count: 1 } });
    assert.deepStrictEqual(frame.raw, raw);
  });
});

describe("decode", () => {
  test("decodes legacy JSON", () => {
    const input = '{"v":"KERI10JSON000023_","t":"icp"}';
    const result = decode(input);

    assert.partialDeepStrictEqual(result, {
      type: "message",
      code: "KERI",
      text: input,
    });
  });

  test("decodes JSON", () => {
    const input = '{"v":"KERICAAJSONAAAi.","t":"icp"}';
    const result = decode(input);

    assert.partialDeepStrictEqual(result, {
      type: "message",
      code: "KERI",
      text: input,
    });
  });

  test("decodes text variable size", () => {
    const input = "7AAAAAAHFITqGxJjULTjbxZ1Ciow-4WgTVll";
    const result = decode(input);

    assert.partialDeepStrictEqual(result, {
      type: "matter",
      code: "7AAA",
      text: input,
    });
  });

  test("decode raw salt", () => {
    const result0 = decode("0ACSTo66vU2CA-j4usUIAEm2");

    assert.partialDeepStrictEqual(result0, {
      raw: new Uint8Array([146, 78, 142, 186, 189, 77, 130, 3, 232, 248, 186, 197, 8, 0, 73, 182]),
    });
  });

  test("decode count code", () => {
    const input = "-VAi";

    const result = decode(input, {});

    assert.partialDeepStrictEqual(result, {
      type: "counter_10",
      code: "-V",
      text: "-VAi",
    });
  });
});
