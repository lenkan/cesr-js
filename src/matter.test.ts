import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { Matter } from "./matter.ts";
import vectors from "../fixtures/cesr_test_vectors.json" with { type: "json" };

describe("Encode values", () => {
  test("cesr date", () => {
    const result = Matter.date(new Date(Date.parse("2024-11-23T16:02:27.123Z")));
    assert.equal(result.text, "1AAG2024-11-23T16c02c27d123000p00c00");
  });

  test("CESR string L0", () => {
    const result = Matter.string("Foobar");
    assert.equal(result.text, "4AACRm9vYmFy");
  });

  test("CESR string L1", () => {
    const result = Matter.string("Foobars");
    assert.equal(result.text, "5AADABGb29iYXJz");
  });

  test("CESR string L2", () => {
    const result = Matter.string("Foobars!");
    assert.equal(result.text, "6AAEAAAEZvb2JhcnMh");
  });
});

describe("Test vector", () => {
  for (const entry of vectors.filter((v) => v.type === "matter")) {
    test(`decode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      const frame = Matter.decoder.decode(entry.qb64);
      const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));

      assert.deepEqual(frame.code, entry.code);
      assert.deepEqual(frame.raw, raw);
    });

    test(`encode qb64 ${entry.type} ${entry.name} - ${entry.qb64.substring(0, 10)}`, () => {
      const raw = Uint8Array.from(Buffer.from(entry.raw as string, "hex"));
      const frame = new Matter({ code: entry.code, raw });

      assert.deepEqual(frame.text, entry.qb64);
    });
  }
});
