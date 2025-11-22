import test, { describe } from "node:test";
import assert from "node:assert";
import vectors from "../fixtures/cesr_test_vectors.json" with { type: "json" };
import {
  decodeCounter,
  decodeIndexer,
  decodeMatter,
  encodeBinary,
  encodeCounter,
  encodeIndexer,
  encodeMatter,
  type FrameData,
  IndexTable,
} from "./encoding.ts";
import path from "node:path";

type TestEntry = (typeof vectors)[number];

function createFrameData(entry: TestEntry): FrameData {
  return {
    code: entry.code,
    raw: Uint8Array.from(Buffer.from(entry.raw as string, "hex")),
    count: entry.count ?? undefined,
    ondex: entry.ondex ?? undefined,
    index: entry.index ?? undefined,
  };
}

describe(path.parse(import.meta.url).base, { skip: process.env.SKIP_TEST_VECTORS }, () => {
  describe("Primitives", () => {
    for (const entry of vectors.filter((v) => v.type === "matter")) {
      test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = decodeMatter(entry.qb64);
        const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));

        assert.deepEqual(frame.code, entry.code);
        assert.deepEqual(frame.raw, raw);
      });

      test(`encode text ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = encodeMatter({
          code: entry.code,
          raw: Uint8Array.from(Buffer.from(entry.raw as string, "hex")),
        });
        assert.deepEqual(frame, entry.qb64);
      });

      test(`encode binary ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = encodeBinary(createFrameData(entry));
        assert.deepEqual(Buffer.from(frame).toString("hex"), entry.qb2);
      });
    }
  });

  describe("Counter v1", () => {
    for (const entry of vectors.filter((v) => v.type === "counter_10")) {
      test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = decodeCounter(entry.qb64);

        assert.deepEqual(frame.code, entry.code.replace(/^--/, "-"));
        assert.deepEqual(frame.count, entry.count);
      });

      test(`encode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = encodeCounter({
          code: entry.code.replace(/^--/, "-"),
          count: entry.count ?? 0,
        });

        assert.deepEqual(frame, entry.qb64);
      });
    }
  });

  describe("Counter v2", () => {
    for (const entry of vectors.filter((v) => v.type === "counter_20")) {
      test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = decodeCounter(entry.qb64);

        assert.deepEqual(frame.code, entry.code.replace(/^--/, "-"));
        assert.deepEqual(frame.count, entry.count);
      });

      test(`encode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = encodeCounter({
          code: entry.code.replace(/^--/, "-"),
          count: entry.count ?? 0,
        });

        assert.deepEqual(frame, entry.qb64);
      });
    }
  });

  describe("Index codes", () => {
    for (const entry of vectors.filter((v) => v.type === "indexer")) {
      test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = decodeIndexer(entry.qb64);
        const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));

        assert.strictEqual(frame.code, entry.code);
        assert.deepEqual(frame.raw, raw);
      });

      test(`encode qb64 ${entry.type} ${entry.name} ${entry.code} - ${entry.qb64.substring(0, 10)}`, () => {
        const indexer = encodeIndexer({
          code: entry.code,
          raw: Uint8Array.from(Buffer.from(entry.raw, "hex")),
          index: entry.index ?? 0,
          ondex: entry.ondex ?? 0,
        });
        assert.strictEqual(indexer, entry.qb64);
      });

      test(`encode binary ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = encodeBinary(createFrameData(entry), IndexTable);
        assert.deepEqual(Buffer.from(frame).toString("hex"), entry.qb2);
      });
    }
  });
});
