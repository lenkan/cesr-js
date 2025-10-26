import test from "node:test";
import assert from "node:assert";
import { Parser } from "./parser.ts";
import { encodeUtf8 } from "./encoding-utf8.ts";
import * as encoding from "./encoding.ts";
import { CountCode_10, CountCode_20, IndexCode, MatterCode } from "./codes.ts";
import { randomBytes } from "node:crypto";

test("Should parse an empty Uint8Array to an empty array", () => {
  const parser = new Parser();

  const frames = Array.from(parser.parse(new Uint8Array([])));

  assert.deepStrictEqual(frames, []);
});

test("Should throw when trying to parse matter without context", () => {
  const parser = new Parser();

  const frame = encoding.encodeMatter({
    code: MatterCode.Ed25519,
    raw: new Uint8Array(32),
  });

  assert.throws(
    () => Array.from(parser.parse(encodeUtf8(frame))),
    new Error("Unsupported cold start byte 68, stream must start with a message, group or op code"),
  );
});

test("Should parse a single frame in group", () => {
  const parser = new Parser();

  const frames = [
    encoding.encodeAttachmentsV1(11),
    encoding.encodeMatter({
      code: MatterCode.Ed25519,
      raw: new Uint8Array(32),
    }),
  ].join("");

  const result = Array.from(parser.parse(encodeUtf8(frames)));

  assert.partialDeepStrictEqual(result[0], {
    type: "cesr",
    code: CountCode_10.AttachmentGroup,
    text: "-VAL",
  });

  assert.partialDeepStrictEqual(result[1], {
    type: "cesr",
    code: MatterCode.Ed25519,
    text: "D" + "A".repeat(43),
  });
});

test("Should throw if group v1 is incomplete", () => {
  const input = encodeUtf8(
    [
      encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 3 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
    ].join(""),
  );

  const parser = new Parser({ version: 1 });

  assert.throws(() => Array.from(parser.parse(input)), "Incomplete group context");
});

test("Should throw if group v2 is incomplete", () => {
  const input = encodeUtf8(
    [
      encoding.encodeCounter({ code: CountCode_20.ControllerIdxSigs, count: (88 * 3) / 4 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
    ].join(""),
  );

  const parser = new Parser({ version: 2 });
  assert.throws(() => Array.from(parser.parse(input)), "Incomplete group context");
});
