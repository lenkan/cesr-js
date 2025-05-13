import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { CountCode_10, IndexCode } from "./codes.ts";
import { encodeBase64Int } from "./base64.ts";
import { parseSync } from "./parser.ts";
import { createReadStream } from "fs";
import { readFile } from "node:fs/promises";
import { encodeMessageBody } from "./version.ts";
import { CountCode_20 } from "./codes.ts";
import { parseMessages } from "./parser.ts";
import { decodeUTF8 } from "./text-encoding.ts";

async function* chunk(filename: string, size = 100): AsyncIterable<Uint8Array> {
  let index = 0;

  const data = Uint8Array.from(await readFile(filename));

  while (index < data.byteLength) {
    yield data.slice(index, index + size);
    index += size;
  }
}

async function collect<T>(iterator: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];

  for await (const item of iterator) {
    result.push(item);
  }

  return result;
}

describe("Parse count code", () => {
  test("Should parse attachments without payload", async () => {
    const sigs = [
      "2AABAFC2S_PGpOQpbMNwQVOqP5jCUJ7EgFH2hr21V6uCbBAkK30idHj0K-ReRCe_o5iIP2bGhBK2MPeEt1P81ZLwk2YJ",
      "2AACAGDeP0o3Ns2ycFFonXIQwGClJimMZ6DHnGfUKJ3O9DzUV5AxVi3Q0oq03fpLyVWRXYCWa72i_o6ftwCVVNnYDN4L",
      "AAAwpoZNY1cZl_0pxlWiHm2RPD1q2XFiFBAzUGOQWeLlBTWbfFtImbZo3cxVKCP2D5Rl49zlaLRekrONYvme2oAC",
    ];

    const attachment = [CountCode_10.ControllerIdxSigs, encodeBase64Int(sigs.length, 2), ...sigs].join("");

    const result = Array.from(parseSync(attachment));

    assert.equal(result.length, 4);
    assert.partialDeepStrictEqual(result[0], { code: CountCode_10.ControllerIdxSigs });
    assert.partialDeepStrictEqual(result[1], { code: IndexCode.Ed25519_Big_Sig });
    assert.partialDeepStrictEqual(result[2], { code: IndexCode.Ed25519_Big_Sig });
    assert.partialDeepStrictEqual(result[3], { code: IndexCode.Ed25519_Sig });
  });
});

test("Test alice", { timeout: 100 }, async () => {
  const result = await collect(parseMessages(createReadStream("./fixtures/alice.cesr", {})));

  assert.equal(result.length, 2);
  assert.equal(result[0].body.t, "icp");

  assert.deepEqual(result[0].attachments, {
    [CountCode_10.ControllerIdxSigs]: [
      "AABNdZWH0GbClYvhaOCeFDVU5ZzfK8fyYV9bRkPy-be92qcPT51PpbAKqleKJ0He9OiwYVQ5sYHUzC7RfUsUQyEE",
    ],
    [CountCode_10.WitnessIdxSigs]: [
      "AAD3BFVo11CTQy2S-5x8gGij_PXBpKDApRtNmoqyITNolRVGNBQKOp0bpgaRqtLGMQBkIejLH4jAf_juj8qGlmIP",
      "ABACLmNhfNNNYNidckbPK_bN0p7v1uXFWee-rMbMrlAIEsD2B5OacGRN77gqje9t-uJHHCLm8DgErQq9UN88ZtcO",
    ],
    [CountCode_10.FirstSeenReplayCouples]: ["0AAAAAAAAAAAAAAAAAAAAAAA", "1AAG2025-02-01T12c03c46d247069p00c00"],
  });

  assert.equal(result[1].body.t, "ixn");
  assert.deepEqual(result[1].attachments, {
    [CountCode_10.ControllerIdxSigs]: [
      "AAAf10ab3SbPCY5g9pkFEITFu64Q-Pu9ErEUot6RM25o68s7x4Y8NxeI2Sq85KCIre_r1RkE4C-QvslgT7LUDF4J",
    ],
    [CountCode_10.WitnessIdxSigs]: [
      "AAB1eHRUTMxehm1_N3mCIuUtVPqFwGoW6LVsGXKthVph8p3szmD4gKdjqJc2S_sG-T9xEQQim_1qGmY439ZcQp0C",
      "ABDA8ndBBf9iAZNyq2k33TILE7WX-_k1CuhQ_bXoQIiUGvYKRweODHWBgbvhH8oTuKl6li4h818aNkQzAsaGj6UO",
    ],
    [CountCode_10.FirstSeenReplayCouples]: ["0AAAAAAAAAAAAAAAAAAAAAAB", "1AAG2025-02-01T12c03c48d444070p00c00"],
  });
});

test("Test witness", { timeout: 100 }, async () => {
  const stream = ReadableStream.from(createReadStream("./fixtures/witness.cesr", {}));

  const result = await collect(parseMessages(stream));

  assert.equal(result.length, 3);
  assert.equal(result[0].body.t, "icp");
  assert.equal(result[1].body.t, "rpy");
});

test("Test parse GEDA", async () => {
  const stream = ReadableStream.from(createReadStream("./fixtures/geda.cesr", {}));
  const events = await collect(parseMessages(stream));

  assert.equal(events.length, 17);
  assert.equal(events[0].body.t, "icp");
  assert.equal(events[1].body.t, "rot");
  assert.equal(events[2].body.t, "rot");
});

test("Test parse credential", async () => {
  const stream = ReadableStream.from(createReadStream("./fixtures/credential.cesr", {}));
  const events = await collect(parseMessages(stream));

  assert.equal(events.length, 6);
  assert.equal(events[0].body.t, "icp");
  assert.equal(events[1].body.t, "ixn");
  assert.equal(events[2].body.t, "ixn");
  assert.equal(events[3].body.t, "vcp");
  assert.equal(events[4].body.t, "iss");
  assert.match(events[5].body.v as string, /^ACDC/);
});

test("Parse GEDA in chunks", async () => {
  const data = ReadableStream.from(chunk("./fixtures/geda.cesr"));

  const events = await collect(parseMessages(data));
  assert.equal(events.length, 17);
});

describe("Parse JSON", () => {
  test("Parse JSON without attachments", async () => {
    const input = JSON.stringify(encodeMessageBody({ t: "icp" }));
    const result = await collect(parseMessages(input));
    assert.equal(result.length, 1);
    assert.deepEqual(result[0].body, { v: "KERI10JSON000023_", t: "icp" });
  });

  test("Parse unfinished JSON without full version string", async () => {
    const input = JSON.stringify(encodeMessageBody({ t: "icp" })).slice(0, 20);

    await assert.rejects(() => collect(parseMessages(input)), new Error("Unexpected end of stream"));
  });
});

describe("Parse CESR 2", async () => {
  test("Parse CESR 2", async () => {
    const input = await readFile("./fixtures/cesr_20.cesr");
    const result = await collect(parseMessages(input));

    assert.equal(result.length, 2);
    const body0 = JSON.parse(decodeUTF8(result[0].body.raw));
    assert.equal(body0.t, "icp");
    assert.equal(body0.v, "KERICAAJSONAAEq.");
    assert.deepEqual(result[0].attachments, {
      [CountCode_20.ControllerIdxSigs]: [
        "AADp5fDEoh8d0VRY27hpkRdVsTKEkUzrH2csEK6FKgjnrgmb2u4m0YhvJCMC5ZO0Zes_okqKcTSjjqpfiJjoa2AH",
      ],
    });

    const body1 = JSON.parse(decodeUTF8(result[1].body.raw));
    assert.equal(body1.t, "ixn");
    assert.equal(body1.v, "KERICAAJSONAADK.");
    assert.deepEqual(result[1].attachments, {
      [CountCode_20.ControllerIdxSigs]: [
        "AABMz1FSzJ8RWzB1D9zF82cOFA4eLc8UsEOa5Ixiu90_ZizqHVOEoD5ajzxO2nLg7iEkyqdcXDAH4A9SSFPgLJQH",
      ],
    });
  });
});
