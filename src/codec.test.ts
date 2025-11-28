import test, { describe } from "node:test";
import { basename } from "node:path";
import assert from "node:assert/strict";
import { Codec } from "./codec.ts";

describe(basename(import.meta.url), () => {
  test("encode crypto", () => {
    const codec = new Codec();

    const sig = codec.crypto.ed25519_sig(new Uint8Array(64));

    const text = sig.text();
    assert.match(text, /^0B/);
  });
});
