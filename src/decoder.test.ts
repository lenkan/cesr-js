import test from "node:test";
import { Decoder } from "./decoder.ts";
import { versify } from "./version.ts";
import assert from "node:assert";

function encodeText(data: string): Uint8Array {
  return new TextEncoder().encode(data);
}

test("Parse JSON without attachments", async () => {
  const data = new TextEncoder().encode(JSON.stringify(versify({ t: "icp" })));
  const decoder = new Decoder();
  const frame = decoder.read(data);

  assert.deepStrictEqual(frame, { type: "json", text: JSON.stringify({ v: "KERI10JSON000023_", t: "icp" }) });
});

test("Parse primitive without attachments", async () => {
  const data = encodeText("DGYKk7w7y1UvaKPNOQkMrXKJmvJtPve4lmsgD8pUuw-5");
  const decoder = new Decoder();
  const frame = decoder.read(data);

  assert.deepStrictEqual(frame, {
    type: "matter",
    text: "DGYKk7w7y1UvaKPNOQkMrXKJmvJtPve4lmsgD8pUuw-5",
    code: "D",
  });
});

test("Parse variable size primitive", async () => {
  const data = encodeText("7AABAAAGTeFrg300ML_ctdBNsvHQgJxS");

  const decoder = new Decoder();
  const frame = decoder.read(data);

  assert.deepStrictEqual(frame, {
    type: "matter",
    text: "7AABAAAGTeFrg300ML_ctdBNsvHQgJxS",
    code: "7AAB",
  });
});
