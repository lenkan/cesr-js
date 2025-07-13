import test, { describe } from "node:test";
import assert from "node:assert/strict";
import vectors from "../fixtures/cesr_test_vectors.json" with { type: "json" };
import { CodeTable, type FrameData } from "./code-table.ts";
import { IndexTable, MatterTable } from "./codes.ts";
import { decodeUtf8 } from "./encoding-utf8.ts";

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

describe("Test vectors", { skip: process.env.SKIP_TEST_VECTORS }, () => {
  describe("Primitives", () => {
    const table = new CodeTable(MatterTable);

    for (const entry of vectors.filter((v) => v.type === "matter")) {
      test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = table.decode(entry.qb64);
        const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));

        assert.deepEqual(frame.code, entry.code);
        assert.deepEqual(frame.raw, raw);
      });

      test(`encode text ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = decodeUtf8(table.encode(createFrameData(entry)));
        assert.deepEqual(frame, entry.qb64);
      });

      test(`encode binary ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = table.encode(createFrameData(entry), "binary");
        assert.deepEqual(Buffer.from(frame).toString("hex"), entry.qb2);
      });
    }
  });

  describe("Counter v1", () => {
    const table = new CodeTable(MatterTable);

    for (const entry of vectors.filter((v) => v.type === "counter_10")) {
      test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = table.decode(entry.qb64);

        assert.deepEqual(frame.code, entry.code);
        assert.deepEqual(frame.count, entry.count);
      });

      test(`encode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        assert(entry.count !== undefined);
        const frame = decodeUtf8(table.encode(createFrameData(entry)));

        assert.deepEqual(frame, entry.qb64);
      });
    }
  });

  describe("Counter v2", () => {
    const table = new CodeTable(MatterTable);

    for (const entry of vectors.filter((v) => v.type === "counter_20")) {
      test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = table.decode(entry.qb64);

        assert.deepEqual(frame.code, entry.code);
        assert.deepEqual(frame.count, entry.count);
      });

      test(`encode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        assert(entry.count !== undefined);
        const frame = decodeUtf8(table.encode(createFrameData(entry)));

        assert.deepEqual(frame, entry.qb64);
      });
    }
  });

  describe("Index codes", () => {
    const table = new CodeTable(IndexTable);

    for (const entry of vectors.filter((v) => v.type === "indexer")) {
      test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = table.decode(entry.qb64);
        const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));

        assert.equal(frame.code, entry.code);
        assert.deepEqual(frame.raw, raw);
      });

      test(`encode qb64 ${entry.type} ${entry.name} ${entry.code} - ${entry.qb64.substring(0, 10)}`, () => {
        const indexer = decodeUtf8(table.encode(createFrameData(entry)));
        assert.equal(indexer, entry.qb64);
      });

      test.skip(`encode binary ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
        const frame = table.encode(createFrameData(entry));
        assert.deepEqual(Buffer.from(frame).toString("hex"), entry.qb2);
      });
    }
  });
});
