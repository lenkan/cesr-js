import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { CountCode_10, CountCode_20, IndexCode, IndexTable } from "./codes.ts";
import { parseSync } from "./parser.ts";
import * as encoding from "./encoding.ts";

test("Should parse indexed signatures", async () => {
  const attachment = [
    encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 3 }),
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

test("Should throw if counter is ended early", async () => {
  const attachment = [
    encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 2 }),
    encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
    encoding.encodeCounter({ code: CountCode_10.WitnessIdxSigs, count: 2 }),
    encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
    encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
  ].join("");

  assert.throws(() => {
    Array.from(parseSync(attachment, { version: 1 }));
  }, new Error(`Unknown code -BAC`));
});

test("Should switch from version 1 to version 2", async () => {
  const attachment = [
    encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 1 }),
    encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
    encoding.encodeGenus({ genus: "AAA", major: 2 }),
    encoding.encodeCounter({
      code: CountCode_20.ControllerIdxSigs,
      count: IndexTable[IndexCode.Ed25519_Sig].fs / 4,
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
    encoding.encodeCounter({
      code: CountCode_20.ControllerIdxSigs,
      count: IndexTable[IndexCode.Ed25519_Sig].fs / 4,
    }),
    encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
    encoding.encodeGenus({ genus: "AAA", major: 1, minor: 0 }),
    encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 1 }),
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
    encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 2 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
  ].join("");

  const result = Array.from(parseSync(attachment, { version: 1 }));
  assert.equal(result.length, 4);
});

test("Should throw if group v1 is incomplete", async () => {
  const attachment = [
    encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 3 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
  ].join("");

  assert.throws(() => Array.from(parseSync(attachment, { version: 1 })), new Error("Unexpected end of stream"));
});

test("Should throw if group v2 is incomplete", async () => {
  const attachment = [
    encoding.encodeCounter({ code: CountCode_20.ControllerIdxSigs, count: (88 * 3) / 4 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
  ].join("");

  assert.throws(() => Array.from(parseSync(attachment, { version: 2 })), new Error("Unexpected end of stream"));
});

test("Should parse JSON after attachment group v1", async () => {
  const attachment = [
    encoding.encodeAttachmentsV1(1 + 23 * 2),
    encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 2 }),
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
    encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 2 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
    encoding.encodeAttachmentsV1(1 + 23 * 2),
    encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 2 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
    encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
  ].join("");

  const result = Array.from(parseSync(attachment, { version: 1 }));
  assert.equal(result.length, 8);
});

test("Should parse transferable idx sig group", async () => {
  const attachment = [
    "-VA0",
    encoding.encodeCounter({ code: CountCode_10.TransIdxSigGroups, count: 1 }),
    "EL8vpSig7NmSxLJ44QSJozcTVYSqPUHVQWPZtyVmPUO_",
    "0AAAAAAAAAAAAAAAAAAAAAAA",
    "EL8vpSig7NmSxLJ44QSJozcTVYSqPUHVQWPZtyVmPUO_",
    encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 1 }),
    encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
  ].join("");

  const result = Array.from(parseSync(attachment, { version: 1 }));
  assert.equal(result.length, 7);
});

test("Should parse grant message attachments", async () => {
  const atc = [
    "-FAB",
    "EDGJXBwhWweT2nQpMiMPt7F9k1nybWCoiPvFp04acnuu",
    "0AAAAAAAAAAAAAAAAAAAAAAA",
    "EDGJXBwhWweT2nQpMiMPt7F9k1nybWCoiPvFp04acnuu",
    "-AAB",
    "AAD-xGXzbSca7bl7uCmPLaWyc8azvwH72WX_KqQ2dh5xhlypvDMg_9rN3lnnHDPUHbs-u3OiqjQ88HBRBacK2F0L",
    // The below pathed material group contains nested pathed material groups
    "-LCy5AACAA-e-evt-FABEDGJXBwhWweT2nQpMiMPt7F9k1nybWCoiPvFp04acnuu0AAAAAAAAAAAAAAAAAAAAAAAEDGJXBwhWweT2nQpMiMPt7F9k1nybWCoiPvFp04acnuu-AABAAAMo3SODbV95rM0KEEZoNX6_cRf7wUHIzKzCc_QrYD0YY_7AuuPfT3sAvs16W1ZsYso3uTbMLnqJq7q0vsj0ZQI",
    "-LAg4AACA-e-acdc-IABEL5jmZNF5iYBz6h_M6TKXKlMkItcWcG2xyvqukWxBCbk0AAAAAAAAAAAAAAAAAAAAAAAEE25P4GEhB9qS6LobUKnObrx2-oef1abw9ZcMempuaCL",
    "-LAW5AACAA-e-iss-VAS-GAB0AAAAAAAAAAAAAAAAAAAAAACEAqxAnXydODkdRnOb0fojJJV_BwU3cqXPIoObes3yi5z",
    "-LBC5AACAA-e-anc-VA--AABAACg0rErmaSflAfExrWZ14dDypHVpgHnw4vnJ4ivrU8IqGjPPi4rpQ4ZeotH8hZ_4erOMNBaYJGmoudrxW6VaNME",
    "-BABAACRhin0S6ADj-OVXysCR1HU-hfbiHX4FFXtTDk9QQGiJmKnhU8EYg4o6xkcxBQRwB1mZX08m9LOrzfH4ukuGCAF",
    "-EAB0AAAAAAAAAAAAAAAAAAAAAAA1AAG2025-06-26T15c50c28d370607p00c00",
  ].join("");

  const result = Array.from(parseSync(atc, { version: 1 }));
  assert.equal(result.length, 36);
});
