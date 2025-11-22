import { createReadStream } from "fs";
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { readFile } from "node:fs/promises";
import { parse } from "./parse.ts";
import { encodeUtf8 } from "./encoding-utf8.ts";
import { MessageBody } from "./message-body.ts";
import { concat } from "./array-utils.ts";
import { encodeGenus, encodeIndexer } from "./encoding.ts";
import path from "node:path";
import { Message } from "./message.ts";
import { IndexCode } from "./codes.ts";
import { VersionString } from "./version-string.ts";

const [sig0, sig1] = [
  encodeIndexer({ code: IndexCode.Ed25519_Sig, raw: crypto.getRandomValues(new Uint8Array(64)), index: 0 }),
  encodeIndexer({ code: IndexCode.Ed25519_Sig, raw: crypto.getRandomValues(new Uint8Array(64)), index: 1 }),
];

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

describe(path.parse(import.meta.filename).base, () => {
  describe("parsing complete messages", () => {
    test("should parse from string", async () => {
      const input = new MessageBody({ v: VersionString.KERI_LEGACY, t: "icp" }).text;
      const result = await collect(parse(input));
      assert.equal(result.length, 1);
    });

    test("should parse from Uint8Array", async () => {
      const input = MessageBody.encode({ v: VersionString.KERI_LEGACY, t: "icp" });
      const result = await collect(parse(input));
      assert.equal(result.length, 1);
    });

    test("should parse from Response", async () => {
      const input = new Response(new MessageBody({ v: VersionString.KERI_LEGACY, t: "icp" }).text);
      assert(input.body);

      const result = await collect(parse(input.body));
      assert.equal(result.length, 1);
    });

    test("should parse message with payload only", async () => {
      const input = MessageBody.encode({ v: VersionString.KERI_LEGACY, t: "icp" });
      const result = await collect(parse(input));

      assert.equal(result.length, 1);
      assert.deepEqual(result[0].body.payload, { v: "KERI10JSON000023_", t: "icp" });
    });

    test("should parse message with attachments", async () => {
      const message = new Message({ v: VersionString.KERI_LEGACY, t: "icp" }, { ControllerIdxSigs: [sig0, sig1] });
      const result = await collect(parse(message.encode()));

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].attachments.ControllerIdxSigs.length, 2);
    });

    test("should parse multiple messages in sequence", async () => {
      const msg1 = new MessageBody({ v: VersionString.KERI_LEGACY, t: "icp", i: "prefix1" });
      const msg2 = new MessageBody({ v: VersionString.KERI_LEGACY, t: "rot", i: "prefix2" });
      const input = msg1.text + msg2.text;

      const messages = await collect(parse(input));

      assert.strictEqual(messages.length, 2);
      assert.strictEqual(messages[0].body.payload.t, "icp");
      assert.strictEqual(messages[1].body.payload.t, "rot");
    });

    test("should parse TransIdxSigGroups correctly", async () => {
      const message = new Message(
        { v: VersionString.KERI_LEGACY, t: "icp" },
        {
          TransIdxSigGroups: [
            {
              prefix: "EALkveIFUPvt38xhtgYYJRCCpAGO7WjjHVR37Pawv67E",
              snu: "5",
              digest: "EBabiu_JCkE0GbiglDXNB5C4NQq-hiGgxhHKXBxkiojg",
              ControllerIdxSigs: [sig0, sig1],
            },
          ],
        },
      );

      const messages = await collect(parse(message.encode()));

      assert.strictEqual(messages.length, 1);
      assert.strictEqual(messages[0].attachments.TransIdxSigGroups?.length, 1);
      assert.strictEqual(messages[0].attachments.TransIdxSigGroups[0].ControllerIdxSigs.length, 2);
    });
  });

  describe("version handling", () => {
    test("should detect version 1 from message body", async () => {
      const message = new Message({ v: VersionString.KERI_LEGACY, t: "icp" });
      const messages = await collect(parse(message.encode()));

      assert.strictEqual(messages.length, 1);
      assert.strictEqual(messages[0].body.version.major, 1);
      assert.strictEqual(messages[0].body.version.minor, 0);
    });

    test("should detect version 2 from genus counter", async () => {
      const input0 = await readFile("./fixtures/cesr_20.cesr");
      const input = concat(encodeUtf8(encodeGenus({ genus: "AAA", major: 2, minor: 0 })), input0);

      const result = await collect(parse(input, { version: 1 }));

      assert.equal(result.length, 2);
      assert.equal(result[0].body.payload.v, "KERICAAJSONAAEq.");
    });

    test("should use version for attachment parsing", async () => {
      const input = await readFile("./fixtures/cesr_20.cesr");
      const result = await collect(parse(input, { version: 2 }));

      assert.equal(result.length, 2);
      assert.equal(result[0].body.payload.t, "icp");
      assert.equal(result[0].attachments.ControllerIdxSigs.length, 1);
    });
  });

  describe("streaming behavior", () => {
    test("should handle message split across multiple chunks", async () => {
      const message = new Message({ v: VersionString.KERI_LEGACY, t: "icp" }, { ControllerIdxSigs: [sig0, sig1] });
      const full = encodeUtf8(message.encode());

      // Split into multiple chunks
      async function* chunks() {
        yield full.slice(0, 50);
        yield full.slice(50, 100);
        yield full.slice(100);
      }

      const messages = await collect(parse(chunks()));

      assert.strictEqual(messages.length, 1);
      assert.strictEqual(messages[0].attachments.ControllerIdxSigs.length, 2);
    });

    test("should buffer incomplete data", async () => {
      const message = new Message({ v: VersionString.KERI_LEGACY, t: "icp" });
      const full = encodeUtf8(message.encode());

      async function* chunks() {
        yield full.slice(0, 30);
        yield full.slice(30);
      }

      const messages = await collect(parse(chunks()));

      assert.strictEqual(messages.length, 1);
    });

    test("should parse chunked file stream", async () => {
      const data = chunk("./fixtures/geda.cesr");

      const events = await collect(parse(data));
      assert.equal(events.length, 17);
    });
  });

  describe("incomplete data handling", () => {
    test("should throw for incomplete message body", async () => {
      const message = new MessageBody({ v: VersionString.KERI_LEGACY, t: "icp" });
      const input = message.text.slice(0, -10);

      await assert.rejects(async () => await collect(parse(input)), /Unexpected end of stream/);
    });

    test("should throw on incomplete stream with partial data", async () => {
      const message = new MessageBody({ v: VersionString.KERI_LEGACY, t: "icp" });
      const input = message.text.slice(0, -10);

      await assert.rejects(async () => await collect(parse(input)), /Unexpected end of stream/);
    });

    test("should throw on unfinished JSON without full version string", async () => {
      const input = new MessageBody({ v: VersionString.KERI_LEGACY, t: "icp" }).text.slice(0, 20);
      await assert.rejects(() => collect(parse(input)), new Error("Unexpected end of stream"));
    });
  });

  describe("edge cases", () => {
    test("should handle empty input", async () => {
      const messages = await collect(parse(""));
      assert.strictEqual(messages.length, 0);
    });

    test("should handle empty Uint8Array", async () => {
      const messages = await collect(parse(new Uint8Array(0)));
      assert.strictEqual(messages.length, 0);
    });
  });

  describe("fixtures", () => {
    test("should parse alice fixture", { timeout: 100 }, async () => {
      const result = await collect(parse(createReadStream("./fixtures/alice.cesr", {})));

      assert.equal(result.length, 2);
      assert.equal(result[0].body.payload.t, "icp");

      assert.equal(result[0].attachments.ControllerIdxSigs.length, 1);
      assert.equal(
        result[0].attachments.ControllerIdxSigs[0],
        "AABNdZWH0GbClYvhaOCeFDVU5ZzfK8fyYV9bRkPy-be92qcPT51PpbAKqleKJ0He9OiwYVQ5sYHUzC7RfUsUQyEE",
      );
      assert.equal(result[0].attachments.WitnessIdxSigs.length, 2);
      assert.equal(
        result[0].attachments.WitnessIdxSigs[0],
        "AAD3BFVo11CTQy2S-5x8gGij_PXBpKDApRtNmoqyITNolRVGNBQKOp0bpgaRqtLGMQBkIejLH4jAf_juj8qGlmIP",
      );
      assert.equal(
        result[0].attachments.WitnessIdxSigs[1],
        "ABACLmNhfNNNYNidckbPK_bN0p7v1uXFWee-rMbMrlAIEsD2B5OacGRN77gqje9t-uJHHCLm8DgErQq9UN88ZtcO",
      );
      assert.equal(result[0].attachments.FirstSeenReplayCouples.length, 1);
      assert.equal(result[0].attachments.FirstSeenReplayCouples[0].fnu, "0");
      assert.equal(result[0].attachments.FirstSeenReplayCouples[0].dt.toISOString(), "2025-02-01T12:03:46.247Z");

      assert.equal(result[1].body.payload.t, "ixn");
      assert.equal(result[1].attachments.ControllerIdxSigs.length, 1);
      assert.equal(
        result[1].attachments.ControllerIdxSigs[0],
        "AAAf10ab3SbPCY5g9pkFEITFu64Q-Pu9ErEUot6RM25o68s7x4Y8NxeI2Sq85KCIre_r1RkE4C-QvslgT7LUDF4J",
      );
      assert.equal(result[1].attachments.WitnessIdxSigs.length, 2);
      assert.equal(
        result[1].attachments.WitnessIdxSigs[0],
        "AAB1eHRUTMxehm1_N3mCIuUtVPqFwGoW6LVsGXKthVph8p3szmD4gKdjqJc2S_sG-T9xEQQim_1qGmY439ZcQp0C",
      );
      assert.equal(
        result[1].attachments.WitnessIdxSigs[1],
        "ABDA8ndBBf9iAZNyq2k33TILE7WX-_k1CuhQ_bXoQIiUGvYKRweODHWBgbvhH8oTuKl6li4h818aNkQzAsaGj6UO",
      );
      assert.equal(result[1].attachments.FirstSeenReplayCouples.length, 1);
      assert.equal(result[1].attachments.FirstSeenReplayCouples[0].fnu, "1");
      assert.equal(result[1].attachments.FirstSeenReplayCouples[0].dt.toISOString(), "2025-02-01T12:03:48.444Z");
    });

    test("should parse witness fixture", { timeout: 100 }, async () => {
      const stream = createReadStream("./fixtures/witness.cesr", {});

      const result = await collect(parse(stream));

      assert.equal(result.length, 3);
      assert.equal(result[0].body.payload.t, "icp");
      assert.equal(result[1].body.payload.t, "rpy");
    });

    test("should parse GEDA fixture", async () => {
      const stream = createReadStream("./fixtures/geda.cesr", {});
      const events = await collect(parse(stream));

      assert.equal(events.length, 17);
      assert.equal(events[0].body.payload.t, "icp");
      assert.equal(events[1].body.payload.t, "rot");
      assert.equal(events[2].body.payload.t, "rot");
    });

    test("should parse credential fixture", async () => {
      const stream = createReadStream("./fixtures/credential.cesr", {});
      const events = await collect(parse(stream));

      assert.equal(events.length, 6);
      assert.equal(events[0].body.payload.t, "icp");
      assert.equal(events[1].body.payload.t, "ixn");
      assert.equal(events[2].body.payload.t, "ixn");
      assert.equal(events[3].body.payload.t, "vcp");
      assert.equal(events[4].body.payload.t, "iss");
      assert.match(events[5].body.payload.v as string, /^ACDC/);
    });

    test("should parse CESR 2.0 fixture", async () => {
      const input = await readFile("./fixtures/cesr_20.cesr");
      const result = await collect(parse(input, { version: 2 }));

      assert.equal(result.length, 2);
      assert.equal(result[0].body.payload.t, "icp");
      assert.equal(result[0].body.payload.v, "KERICAAJSONAAEq.");
      assert.equal(result[0].attachments.ControllerIdxSigs.length, 1);
      assert.equal(
        result[0].attachments.ControllerIdxSigs[0],
        "AACME000QcZDeDtgMwJC6b0qhWckJBL-U9Ls9dhYKO9mcaIdffYYO_gi6tFl1xvKMwre886T8ODYLLVrMqlc3TcN",
      );
      assert.equal(result[1].body.payload.t, "ixn");
      assert.equal(result[1].body.payload.v, "KERICAAJSONAADK.");
      assert.equal(result[1].attachments.ControllerIdxSigs.length, 1);
      assert.equal(
        result[1].attachments.ControllerIdxSigs[0],
        "AADBLfcct7HWPJkVWt09FakB1hNbSTj6D5o9m4yYOMBfUdv7msDsPRSK46ScKQkIO4XAiAkg_xzmvAmsSTkvoLwM",
      );
    });

    test("should parse mailbox fixture with TransIdxSigGroups", { timeout: 100 }, async () => {
      const result = await collect(parse(createReadStream("./fixtures/mailbox.cesr", {})));

      assert.equal(result.length, 4);
      assert.equal(result[0].body.payload.t, "icp");
      assert.equal(result[1].body.payload.t, "rpy");
      assert.equal(result[2].body.payload.t, "rpy");
      assert.equal(result[3].body.payload.t, "rpy");

      assert.equal(result[3].attachments.TransIdxSigGroups.length, 1);
      assert.equal(result[3].attachments.TransIdxSigGroups[0].prefix, "EL8vpSig7NmSxLJ44QSJozcTVYSqPUHVQWPZtyVmPUO_");
      assert.equal(result[3].attachments.TransIdxSigGroups[0].snu, "0");
      assert.equal(result[3].attachments.TransIdxSigGroups[0].digest, "EL8vpSig7NmSxLJ44QSJozcTVYSqPUHVQWPZtyVmPUO_");
      assert.equal(result[3].attachments.TransIdxSigGroups[0].ControllerIdxSigs.length, 1);
      assert.equal(
        result[3].attachments.TransIdxSigGroups[0].ControllerIdxSigs[0],
        "AAA9rX7EH8MSl9OIW67yuFoMBgPhrOHrrf0tLyZpOLoD6HbVSr4qM7n0itmwvG3o9YbyZkmXOE7288K8KNsdS3UC",
      );
    });
  });
});
