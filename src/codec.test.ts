import test, { describe } from "node:test";
import { basename } from "node:path";
import assert from "node:assert/strict";
import { Indexer } from "./indexer.ts";
import { Matter } from "./matter.ts";
import { cesr } from "./codec.ts";

describe(basename(import.meta.url), () => {
  test("encode ed25519 signature", () => {
    const sig = cesr.crypto.ed25519_sig(new Uint8Array(64));

    const text = sig.text();

    assert.strictEqual(sig.code, "0B");
    assert.match(text, /^0B/);
  });

  test("encode ed25519 indexed signature", () => {
    const sig = cesr.crypto.ed25519_sig(new Uint8Array(64), 12, 3);

    const text = sig.text();

    assert(sig instanceof Indexer);
    assert.strictEqual(sig.code, "2A");
    assert.match(text, /^2AAMAD/);
  });

  test("encode blake3_256 digest", () => {
    const digest = cesr.crypto.blake3_256(new Uint8Array(32));

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

  test("encode ed448 signature", () => {
    const sig = cesr.crypto.ed448_sig(new Uint8Array(114));

    const text = sig.text();

    assert.strictEqual(sig.code, Matter.Code.Ed448_Sig);
    assert.match(text, /^1AAE/);
  });

  test("encode ed448 indexed signature", () => {
    const sig = cesr.crypto.ed448_sig(new Uint8Array(114), 5, 1);

    const text = sig.text();

    assert(sig instanceof Indexer);
    assert.strictEqual(sig.code, Indexer.Code.Ed448_Sig);
    assert.match(text, /^0AFBAA/);
  });

  test("encode blake3_512 digest", () => {
    const digest = cesr.crypto.blake3_512(new Uint8Array(64));

    const text = digest.text();

    assert.strictEqual(digest.code, Matter.Code.Blake3_512);
    assert.match(text, /^0D/);
  });

  test("encode sha3_256 digest", () => {
    const digest = cesr.crypto.sha3_256(new Uint8Array(32));

    const text = digest.text();

    assert.strictEqual(digest.code, Matter.Code.SHA3_256);
    assert.match(text, /^H/);
  });

  test("encode tag primitive", () => {
    const matter = cesr.primitive.tag("oo");

    assert.strictEqual(matter.code, Matter.Code.Tag2);
  });

  test("encode hex primitive", () => {
    const matter = cesr.primitive.hex("aff");

    assert.strictEqual(matter.code, Matter.Code.Salt_128);
    assert.strictEqual(matter.as.hex(), "aff");
  });

  test("encode date primitive", () => {
    const date = new Date("2024-05-01T12:34:56.789Z");
    const matter = cesr.primitive.date(date);

    assert.strictEqual(matter.code, Matter.Code.DateTime);
    assert.strictEqual(matter.as.date().toISOString(), date.toISOString());
  });
});
