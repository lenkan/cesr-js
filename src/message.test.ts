import { createReadStream } from "fs";
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { parseMessages } from "./message.ts";
import { readFile } from "node:fs/promises";
import { encoding } from "./encoding.ts";

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

test("Test alice", { timeout: 100 }, async () => {
  const result = await collect(parseMessages(createReadStream("./fixtures/alice.cesr", {})));

  assert.equal(result.length, 2);
  assert.equal(result[0].payload.t, "icp");

  assert.deepEqual(result[0].attachments, [
    "-VBU",
    "-AAB",
    "AABNdZWH0GbClYvhaOCeFDVU5ZzfK8fyYV9bRkPy-be92qcPT51PpbAKqleKJ0He9OiwYVQ5sYHUzC7RfUsUQyEE",
    "-BAC",
    "AAD3BFVo11CTQy2S-5x8gGij_PXBpKDApRtNmoqyITNolRVGNBQKOp0bpgaRqtLGMQBkIejLH4jAf_juj8qGlmIP",
    "ABACLmNhfNNNYNidckbPK_bN0p7v1uXFWee-rMbMrlAIEsD2B5OacGRN77gqje9t-uJHHCLm8DgErQq9UN88ZtcO",
    "-EAB",
    "0AAAAAAAAAAAAAAAAAAAAAAA",
    "1AAG2025-02-01T12c03c46d247069p00c00",
  ]);

  assert.equal(result[1].payload.t, "ixn");
  assert.deepEqual(result[1].attachments, [
    "-VBU",
    "-AAB",
    "AAAf10ab3SbPCY5g9pkFEITFu64Q-Pu9ErEUot6RM25o68s7x4Y8NxeI2Sq85KCIre_r1RkE4C-QvslgT7LUDF4J",
    "-BAC",
    "AAB1eHRUTMxehm1_N3mCIuUtVPqFwGoW6LVsGXKthVph8p3szmD4gKdjqJc2S_sG-T9xEQQim_1qGmY439ZcQp0C",
    "ABDA8ndBBf9iAZNyq2k33TILE7WX-_k1CuhQ_bXoQIiUGvYKRweODHWBgbvhH8oTuKl6li4h818aNkQzAsaGj6UO",
    "-EAB",
    "0AAAAAAAAAAAAAAAAAAAAAAB",
    "1AAG2025-02-01T12c03c48d444070p00c00",
  ]);
});

test("Test witness", { timeout: 100 }, async () => {
  const stream = ReadableStream.from(createReadStream("./fixtures/witness.cesr", {}));

  const result = await collect(parseMessages(stream));

  assert.equal(result.length, 3);
  assert.equal(result[0].payload.t, "icp");
  assert.equal(result[1].payload.t, "rpy");
});

test("Test parse GEDA", async () => {
  const stream = ReadableStream.from(createReadStream("./fixtures/geda.cesr", {}));
  const events = await collect(parseMessages(stream));

  assert.equal(events.length, 17);
  assert.equal(events[0].payload.t, "icp");
  assert.equal(events[1].payload.t, "rot");
  assert.equal(events[2].payload.t, "rot");
});

test("Test parse credential", async () => {
  const stream = ReadableStream.from(createReadStream("./fixtures/credential.cesr", {}));
  const events = await collect(parseMessages(stream));

  assert.equal(events.length, 6);
  assert.equal(events[0].payload.t, "icp");
  assert.equal(events[1].payload.t, "ixn");
  assert.equal(events[2].payload.t, "ixn");
  assert.equal(events[3].payload.t, "vcp");
  assert.equal(events[4].payload.t, "iss");
  assert.match(events[5].payload.v as string, /^ACDC/);
});

test("Parse GEDA in chunks", async () => {
  const data = ReadableStream.from(chunk("./fixtures/geda.cesr"));

  const events = await collect(parseMessages(data));
  assert.equal(events.length, 17);
});

describe("Parse JSON", () => {
  test("Parse JSON without attachments", async () => {
    const input = encoding.encodeMessage({ t: "icp" }, { legacy: true });
    const result = await collect(parseMessages(input));
    assert.equal(result.length, 1);
    assert.deepEqual(result[0].payload, { v: "KERI10JSON000023_", t: "icp" });
  });

  test("Parse unfinished JSON without full version string", async () => {
    const input = encoding.encodeMessage({ t: "icp" }).slice(0, 20);

    await assert.rejects(() => collect(parseMessages(input)), new Error("Unexpected end of stream"));
  });
});

describe("Parse CESR 2", async () => {
  test("Parse CESR 2", async () => {
    const input = await readFile("./fixtures/cesr_20.cesr");
    const result = await collect(parseMessages(input, { version: 2 }));

    assert.equal(result.length, 2);
    assert.equal(result[0].payload.t, "icp");
    assert.equal(result[0].payload.v, "KERICAAJSONAAEq.");
    assert.deepEqual(result[0].attachments, [
      "-CAX",
      "-KAW",
      "AACME000QcZDeDtgMwJC6b0qhWckJBL-U9Ls9dhYKO9mcaIdffYYO_gi6tFl1xvKMwre886T8ODYLLVrMqlc3TcN",
    ]);
    assert.equal(result[1].payload.t, "ixn");
    assert.equal(result[1].payload.v, "KERICAAJSONAADK.");
    assert.deepEqual(result[1].attachments, [
      "-CAX",
      "-KAW",
      "AADBLfcct7HWPJkVWt09FakB1hNbSTj6D5o9m4yYOMBfUdv7msDsPRSK46ScKQkIO4XAiAkg_xzmvAmsSTkvoLwM",
    ]);
  });
});

test("Test oobi with mailbox", { timeout: 100 }, async () => {
  const result = await collect(parseMessages(createReadStream("./fixtures/mailbox.cesr", {})));

  assert.equal(result.length, 4);
  assert.equal(result[0].payload.t, "icp");
  assert.equal(result[1].payload.t, "rpy");
  assert.equal(result[2].payload.t, "rpy");
  assert.equal(result[3].payload.t, "rpy");

  assert.deepEqual(result[3].attachments, [
    "-VA0",
    "-FAB",
    "EL8vpSig7NmSxLJ44QSJozcTVYSqPUHVQWPZtyVmPUO_",
    "0AAAAAAAAAAAAAAAAAAAAAAA",
    "EL8vpSig7NmSxLJ44QSJozcTVYSqPUHVQWPZtyVmPUO_",
    "-AAB",
    "AAA9rX7EH8MSl9OIW67yuFoMBgPhrOHrrf0tLyZpOLoD6HbVSr4qM7n0itmwvG3o9YbyZkmXOE7288K8KNsdS3UC",
  ]);
});
