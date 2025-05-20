import test, { describe } from "node:test";
import vectors from "../fixtures/cesr_test_vectors.json" with { type: "json" };
import {
  decodeCounterV1,
  decodeCounterV2,
  decodeIndexer,
  decodeMatter,
  encodeAttachmentsV1,
  encodeAttachmentsV2,
  encodeCounterV1,
  encodeCounterV2,
  encodeDate,
  encodeIndexedSignature,
  encodeIndexer,
  encodeMatter,
  encodeString,
} from "./encoding.ts";
import assert from "node:assert/strict";

describe("Matter", () => {
  describe("Encode values", () => {
    test("cesr date", () => {
      const result = encodeDate(new Date(Date.parse("2024-11-23T16:02:27.123Z")));
      assert.equal(result, "1AAG2024-11-23T16c02c27d123000p00c00");
    });

    test("CESR string L0", () => {
      const result = encodeString("Foobar");
      assert.equal(result, "4AACRm9vYmFy");
    });

    test("CESR string L1", () => {
      const result = encodeString("Foobars");
      assert.equal(result, "5AADABGb29iYXJz");
    });

    test("CESR string L2", () => {
      const result = encodeString("Foobars!");
      assert.equal(result, "6AAEAAAEZvb2JhcnMh");
    });
  });

  describe("Test vector", () => {
    for (const entry of vectors.filter((v) => v.type === "matter")) {
      test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = decodeMatter(entry.qb64);
        const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));

        assert.deepEqual(frame.code, entry.code);
        assert.deepEqual(frame.raw, raw);
      });

      test(`encode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));
        const frame = encodeMatter({ code: entry.code, raw });

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

      const result = encodeIndexedSignature("ed25519", raw, 28);
      assert.equal(result, "AcBpL4NGn6MqtSdHtAS25oFXKDKbZk5_X40_AJwELBnCRZiNz__YtUosYNHVOiEWbdMW3t62sFuGWRfaACKi-2LH");
    });
  });

  describe("Text index vector", () => {
    for (const entry of vectors.filter((v) => v.type === "indexer")) {
      test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = decodeIndexer(entry.qb64);
        const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));

        assert.equal(frame.code, entry.code);
        assert.deepEqual(frame.raw, raw);
      });

      test(`encode qb64 ${entry.type} ${entry.name} ${entry.code} - ${entry.qb64.substring(0, 10)}`, () => {
        const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));

        const indexer = encodeIndexer({
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

describe("Encode counter v1", () => {
  test("Encode attachment group", () => {
    const result = encodeAttachmentsV1(39);
    assert.equal(result, "-VAn");
  });

  test("Encode big attachment group", () => {
    const result = encodeAttachmentsV1(64 ** 2 + 1);
    assert.equal(result, "--VAABAB");
  });
});

describe("Encode counter v2", () => {
  test("Encode attachment group", () => {
    const result = encodeAttachmentsV2(39);
    assert.equal(result, "-CAn");
  });

  test("Encode big attachment group", () => {
    const result = encodeAttachmentsV2(64 ** 2 + 1);
    assert.equal(result, "--CAABAB");
  });
});

describe("Counter v1 test vector", () => {
  for (const entry of vectors.filter((v) => v.type === "counter_10")) {
    test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      const frame = decodeCounterV1(entry.qb64);

      assert.deepEqual(frame.code, entry.code);
      assert.deepEqual(frame.count, entry.count);
    });

    test(`encode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      assert(entry.count !== undefined);
      const frame = encodeCounterV1(entry);

      assert.deepEqual(frame, entry.qb64);
    });
  }
});

describe("Counter v1 test vector", () => {
  for (const entry of vectors.filter((v) => v.type === "counter_20")) {
    test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      const frame = decodeCounterV2(entry.qb64);

      assert.deepEqual(frame.code, entry.code);
      assert.deepEqual(frame.count, entry.count);
    });

    test(`encode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      assert(entry.count !== undefined);
      const frame = encodeCounterV2(entry);

      assert.deepEqual(frame, entry.qb64);
    });
  }
});
