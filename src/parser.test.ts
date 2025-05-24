import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { CountCode_10, CountCode_20, IndexCode, IndexTable } from "./codes.ts";
import { parseSync } from "./parser.ts";
import * as encoding from "./encoding.ts";

test("Should indexed signatures", async () => {
  const attachment = [
    encoding.encodeCounterV1({ code: CountCode_10.ControllerIdxSigs, count: 3 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
    encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
  ].join("");

  const result = Array.from(parseSync(attachment, { version: 1 }));

  assert.equal(result.length, 4);
  assert.partialDeepStrictEqual(result[0], { code: CountCode_10.ControllerIdxSigs });
  assert.partialDeepStrictEqual(result[1], { code: IndexCode.Ed25519_Big_Sig });
  assert.partialDeepStrictEqual(result[2], { code: IndexCode.Ed25519_Big_Sig });
  assert.partialDeepStrictEqual(result[3], { code: IndexCode.Ed25519_Sig });
});

test("Should switch from version 1 to version 2", async () => {
  const attachment = [
    encoding.encodeCounterV1({ code: CountCode_10.ControllerIdxSigs, count: 1 }),
    encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
    encoding.encodeGenus({ major: 2 }),
    encoding.encodeCounterV2({
      code: CountCode_20.ControllerIdxSigs,
      count: IndexTable.sizes[IndexCode.Ed25519_Sig].fs / 4,
    }),
    encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
  ].join("");

  const result = Array.from(parseSync(attachment, { version: 1 }));

  assert.equal(result.length, 5);
  assert.partialDeepStrictEqual(result[0], { code: CountCode_10.ControllerIdxSigs });
  assert.partialDeepStrictEqual(result[1], { code: IndexCode.Ed25519_Sig });
  assert.partialDeepStrictEqual(result[2], { code: CountCode_10.KERIACDCGenusVersion });
  assert.partialDeepStrictEqual(result[3], { code: CountCode_20.ControllerIdxSigs });
  assert.partialDeepStrictEqual(result[4], { code: IndexCode.Ed25519_Sig });
});

test("Should switch from version 2 to version 1", async () => {
  const attachment = [
    encoding.encodeCounterV2({
      code: CountCode_20.ControllerIdxSigs,
      count: IndexTable.sizes[IndexCode.Ed25519_Sig].fs / 4,
    }),
    encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
    encoding.encodeGenus({ major: 1, minor: 0 }),
    encoding.encodeCounterV1({ code: CountCode_10.ControllerIdxSigs, count: 1 }),
    encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
  ].join("");

  const result = Array.from(parseSync(attachment, { version: 2 }));

  assert.equal(result.length, 5);
  assert.partialDeepStrictEqual(result[0], { code: CountCode_20.ControllerIdxSigs });
  assert.partialDeepStrictEqual(result[1], { code: IndexCode.Ed25519_Sig });
  assert.partialDeepStrictEqual(result[2], { code: CountCode_10.KERIACDCGenusVersion });
  assert.partialDeepStrictEqual(result[3], { code: CountCode_10.ControllerIdxSigs });
  assert.partialDeepStrictEqual(result[4], { code: IndexCode.Ed25519_Sig });
});

test("Should parse attachment group v1", async () => {
  const attachment = [
    encoding.encodeAttachmentsV1(1 + 23 * 2),
    encoding.encodeCounterV1({ code: CountCode_10.ControllerIdxSigs, count: 2 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
  ].join("");

  const result = Array.from(parseSync(attachment, { version: 1 }));
  assert.equal(result.length, 4);
});

test("Should throw if group v1 is incomplete", async () => {
  const attachment = [
    encoding.encodeCounterV1({ code: CountCode_10.ControllerIdxSigs, count: 3 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
  ].join("");

  assert.throws(() => Array.from(parseSync(attachment, { version: 1 })), new Error("Unexpected end of stream"));
});

test("Should throw if group v2 is incomplete", async () => {
  const attachment = [
    encoding.encodeCounterV2({ code: CountCode_20.ControllerIdxSigs, count: (88 * 3) / 4 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
  ].join("");

  assert.throws(() => Array.from(parseSync(attachment, { version: 2 })), new Error("Unexpected end of stream"));
});

test("Should parse JSON after attachment group v1", async () => {
  const attachment = [
    encoding.encodeAttachmentsV1(1 + 23 * 2),
    encoding.encodeCounterV1({ code: CountCode_10.ControllerIdxSigs, count: 2 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
    encoding.encodeMessage({ payload: { message: "foo" }, protocol: "KERI", major: 1 }),
  ].join("");

  const result = Array.from(parseSync(attachment, { version: 1 }));
  assert.equal(result.length, 5);
});

test("Should parse multiple attachment groups", async () => {
  const attachment = [
    encoding.encodeAttachmentsV1(1 + 23 * 2),
    encoding.encodeCounterV1({ code: CountCode_10.ControllerIdxSigs, count: 2 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
    encoding.encodeAttachmentsV1(1 + 23 * 2),
    encoding.encodeCounterV1({ code: CountCode_10.ControllerIdxSigs, count: 2 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
  ].join("");

  const result = Array.from(parseSync(attachment, { version: 1 }));
  assert.equal(result.length, 8);
});
