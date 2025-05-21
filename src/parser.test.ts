import test from "node:test";
import assert from "node:assert/strict";
import { CountCode_10, CountCode_20, IndexCode, IndexTable } from "./codes.ts";
import { parseSync } from "./parser.ts";
import { encodeCounterV1, encodeCounterV2, encodeGenus, encodeIndexedSignature, encodeIndexer } from "./encoding.ts";
import { randomBytes } from "node:crypto";

test("Should indexed signatures", async () => {
  const attachment = [
    encodeCounterV1({ code: CountCode_10.ControllerIdxSigs, count: 3 }),
    encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
    encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
    encodeIndexedSignature("ed25519", randomBytes(64), 0),
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
    encodeCounterV1({ code: CountCode_10.ControllerIdxSigs, count: 1 }),
    encodeIndexedSignature("ed25519", randomBytes(64), 0),
    encodeGenus({ major: 2 }),
    encodeCounterV2({ code: CountCode_20.ControllerIdxSigs, count: IndexTable.sizes[IndexCode.Ed25519_Sig].fs / 4 }),
    encodeIndexedSignature("ed25519", randomBytes(64), 0),
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
    encodeCounterV2({ code: CountCode_20.ControllerIdxSigs, count: IndexTable.sizes[IndexCode.Ed25519_Sig].fs / 4 }),
    encodeIndexedSignature("ed25519", randomBytes(64), 0),
    encodeGenus({ major: 1, minor: 0 }),
    encodeCounterV1({ code: CountCode_10.ControllerIdxSigs, count: 1 }),
    encodeIndexedSignature("ed25519", randomBytes(64), 0),
  ].join("");

  const result = Array.from(parseSync(attachment, { version: 2 }));

  assert.equal(result.length, 5);
  assert.partialDeepStrictEqual(result[0], { code: CountCode_20.ControllerIdxSigs });
  assert.partialDeepStrictEqual(result[1], { code: IndexCode.Ed25519_Sig });
  assert.partialDeepStrictEqual(result[2], { code: CountCode_10.KERIACDCGenusVersion });
  assert.partialDeepStrictEqual(result[3], { code: CountCode_10.ControllerIdxSigs });
  assert.partialDeepStrictEqual(result[4], { code: IndexCode.Ed25519_Sig });
});
