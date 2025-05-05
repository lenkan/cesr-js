import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { Indexer } from "./indexer.ts";
import vectors from "../fixtures/cesr_test_vectors.json" with { type: "json" };

describe("Encode indexer", () => {
  test("Encode indexed signature", () => {
    const raw = Uint8Array.from(
      Buffer.from(
        "692f83469fa32ab52747b404b6e6815728329b664e7f5f8d3f009c042c19c245988dcfffd8b54a2c60d1d53a21166dd316dedeb6b05b865917da0022a2fb62c7",
        "hex",
      ),
    );

    const result = Indexer.signature("Ed25519", raw, 28);
    assert.equal(
      result.text,
      "AcBpL4NGn6MqtSdHtAS25oFXKDKbZk5_X40_AJwELBnCRZiNz__YtUosYNHVOiEWbdMW3t62sFuGWRfaACKi-2LH",
    );
  });
});

describe("Text index vector", () => {
  for (const entry of vectors.filter((v) => v.type === "indexer")) {
    test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      const frame = Indexer.decoder.decode(entry.qb64);
      const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));

      assert.equal(frame.code, entry.code);
      assert.deepEqual(frame.raw, raw);
    });

    test(`encode qb64 ${entry.type} ${entry.name} ${entry.code} - ${entry.qb64.substring(0, 10)}`, () => {
      const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));

      const indexer = new Indexer({
        ondex: entry.ondex ?? undefined,
        index: entry.index,
        code: entry.code,
        raw,
      });

      assert.equal(indexer.text, entry.qb64);
    });
  }
});
