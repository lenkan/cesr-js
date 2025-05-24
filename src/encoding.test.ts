import test, { describe } from "node:test";
import vectors from "../fixtures/cesr_test_vectors.json" with { type: "json" };
import { Decoder, Encoder } from "./encoding.ts";
import assert from "node:assert/strict";
import { encodeUtf8 } from "./encoding-utf8.ts";

const encoder = new Encoder();
const decoder = new Decoder();

describe("encode", () => {
  test("should throw if raw does not have enough bytes", () => {
    assert.throws(() => {
      encoder.encode(
        { code: "0A", raw: new Uint8Array(63) },
        { hards: { "0A": 2 }, sizes: { "0A": { hs: 2, ss: 0, fs: 88 } } },
      );
    }, new Error("Encoded size 86 does not match expected size 88"));
  });
});

describe("Encode message", () => {
  test("Should encode legacy version string", () => {
    const result = encoder.encodeVersionString({ protocol: "ACDC", legacy: true });
    assert.strictEqual(result, "ACDC10JSON000000_");
  });

  test("Should encode version string", () => {
    const result = encoder.encodeVersionString({ protocol: "ACDC" });
    assert.strictEqual(result, "ACDCBAAJSONAAAA.");
  });

  test("Should add legacy version to object", () => {
    const result = encoder.encodeMessage({ a: 1 }, { legacy: true });

    assert.strictEqual(result, '{"v":"KERI10JSON00001f_","a":1}');
  });

  test("Should add version to object", () => {
    const result = encoder.encodeMessage({ a: 1 });

    assert.strictEqual(result, '{"v":"KERIBAAJSONAAAe.","a":1}');
  });
});

describe("Decode message", () => {
  test("Should parse legacy keri version", () => {
    // PPPPvvKKKKllllll_
    const result = decoder.decodeVersionString(encodeUtf8(JSON.stringify({ v: "KERI10JSON00000a_" })));
    assert.deepStrictEqual(result, {
      protocol: "KERI",
      major: 1,
      minor: 0,
      kind: "JSON",
      size: 10,
      legacy: true,
    });
  });

  test("Should parse keri version", () => {
    // PPPPVVVKKKKBBBB.
    const result = decoder.decodeVersionString(encodeUtf8(JSON.stringify({ v: "KERICABJSONAAAB." })));
    assert.deepStrictEqual(result, {
      protocol: "KERI",
      major: 2,
      minor: 1,
      kind: "JSON",
      size: 1,
      legacy: false,
    });
  });
});

describe("Matter", () => {
  describe("Encode values", () => {
    test("cesr date", () => {
      const result = encoder.encodeDate(new Date(Date.parse("2024-11-23T16:02:27.123Z")));
      assert.equal(result, "1AAG2024-11-23T16c02c27d123000p00c00");
    });

    test("CESR string L0", () => {
      const result = encoder.encodeString("Foobar");
      assert.equal(result, "4AACRm9vYmFy");
    });

    test("CESR string L1", () => {
      const result = encoder.encodeString("Foobars");
      assert.equal(result, "5AADABGb29iYXJz");
    });

    test("CESR string L2", () => {
      const result = encoder.encodeString("Foobars!");
      assert.equal(result, "6AAEAAAEZvb2JhcnMh");
    });
  });

  describe("Test vector", () => {
    for (const entry of vectors.filter((v) => v.type === "matter")) {
      test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = decoder.decodeMatter(entry.qb64);
        const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));

        assert.deepEqual(frame.code, entry.code);
        assert.deepEqual(frame.raw, raw);
      });

      test(`encode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));
        const frame = encoder.encodeMatter({ code: entry.code, raw });

        assert.deepEqual(frame, entry.qb64);
      });
    }
  });
});

describe("Indexer", () => {
  describe("Encode indexer", () => {
    test("Encode indexed signature", () => {
      const raw = Uint8Array.from(
        Buffer.from(
          "692f83469fa32ab52747b404b6e6815728329b664e7f5f8d3f009c042c19c245988dcfffd8b54a2c60d1d53a21166dd316dedeb6b05b865917da0022a2fb62c7",
          "hex",
        ),
      );

      const result = encoder.encodeIndexedSignature("ed25519", raw, 28);
      assert.equal(result, "AcBpL4NGn6MqtSdHtAS25oFXKDKbZk5_X40_AJwELBnCRZiNz__YtUosYNHVOiEWbdMW3t62sFuGWRfaACKi-2LH");
    });
  });

  describe("Text index vector", () => {
    for (const entry of vectors.filter((v) => v.type === "indexer")) {
      test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = decoder.decodeIndexer(entry.qb64);
        const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));

        assert.equal(frame.code, entry.code);
        assert.deepEqual(frame.raw, raw);
      });

      test(`encode qb64 ${entry.type} ${entry.name} ${entry.code} - ${entry.qb64.substring(0, 10)}`, () => {
        const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));

        const indexer = encoder.encodeIndexer({
          ondex: entry.ondex ?? undefined,
          index: entry.index,
          code: entry.code,
          raw,
        });

        assert.equal(indexer, entry.qb64);
      });
    }
  });
});

describe("Counter v1", () => {
  test("Encode attachment group", () => {
    const result = encoder.encodeAttachmentsV1(39);
    assert.equal(result, "-VAn");
  });

  test("Encode big attachment group", () => {
    const result = encoder.encodeAttachmentsV1(64 ** 2 + 1);
    assert.equal(result, "--VAABAB");
  });

  test("Encode genus", () => {
    const result = encoder.encodeGenus({ major: 3, minor: 1239 });
    assert.equal(result, "-_AAADTX");
  });

  test("Encode genus without minor", () => {
    const result = encoder.encodeGenus({ major: 3 });
    assert.equal(result, "-_AAADAA");
  });

  test("Decode genus", () => {
    const result = decoder.decodeGenus("-_AAADTX");
    assert.deepEqual(result, { major: 3, minor: 1239 });
  });
});

describe("Counter v2", () => {
  test("Encode attachment group", () => {
    const result = encoder.encodeAttachmentsV2(39);
    assert.equal(result, "-CAn");
  });

  test("Encode big attachment group", () => {
    const result = encoder.encodeAttachmentsV2(64 ** 2 + 1);
    assert.equal(result, "--CAABAB");
  });
});

describe("Counter v1 test vector", () => {
  for (const entry of vectors.filter((v) => v.type === "counter_10")) {
    test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      const frame = decoder.decodeCounterV1(entry.qb64);

      assert.deepEqual(frame.code, entry.code);
      assert.deepEqual(frame.count, entry.count);
    });

    test(`encode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      assert(entry.count !== undefined);
      const frame = encoder.encodeCounterV1(entry);

      assert.deepEqual(frame, entry.qb64);
    });
  }
});

describe("Counter v1 test vector", () => {
  for (const entry of vectors.filter((v) => v.type === "counter_20")) {
    test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      const frame = decoder.decodeCounterV2(entry.qb64);

      assert.deepEqual(frame.code, entry.code);
      assert.deepEqual(frame.count, entry.count);
    });

    test(`encode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      assert(entry.count !== undefined);
      const frame = encoder.encodeCounterV2(entry);

      assert.deepEqual(frame, entry.qb64);
    });
  }
});
