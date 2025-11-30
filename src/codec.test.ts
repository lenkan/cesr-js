import test, { describe } from "node:test";
import { basename } from "node:path";
import assert from "node:assert/strict";
import { Indexer } from "./indexer.ts";
import { cesr } from "./codec.ts";

describe(basename(import.meta.url), () => {
  test("encode ed25519 signature", () => {
    const sig = cesr.signature.ed25519(new Uint8Array(64));

    const text = sig.text();

    assert.strictEqual(sig.code, "0B");
    assert.match(text, /^0B/);
  });

  test("encode ed25519 indexed signature", () => {
    const sig = cesr.signature.ed25519(new Uint8Array(64), 12, 3);

    const text = sig.text();

    assert(sig instanceof Indexer);
    assert.strictEqual(sig.code, "2A");
    assert.match(text, /^2AAMAD/);
  });

  test("encode blake3_256 digest", () => {
    const digest = cesr.digest.blake3_256(new Uint8Array(32));

    const text = digest.text();
    assert.match(text, /^E/);
  });

  test("encode string", () => {
    const matter = cesr.primitive.string("Foobar!");

    const text = matter.text();

    assert.strictEqual(text, "6BADAABGb29iYXIh");
    assert.strictEqual(matter.quadlets, 4);
    assert.strictEqual(matter.as.string(), "Foobar!");
  });
});
