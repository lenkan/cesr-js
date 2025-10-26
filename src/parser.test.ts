import test from "node:test";
import assert from "node:assert";
import { IncompleteGroupParserError, Parser } from "./parser.ts";
import { encodeUtf8 } from "./encoding-utf8.ts";
import * as encoding from "./encoding.ts";
import { CountCode_10, CountCode_20, IndexCode, IndexTable, MatterCode } from "./codes.ts";
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

test("Should throw if input ends before group is complete", () => {
  const input = encodeUtf8(
    [
      encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 3 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
    ].join(""),
  );

  const parser = new Parser({ version: 1 });

  assert.throws(
    () => Array.from(parser.parse(input)),
    new IncompleteGroupParserError({
      code: CountCode_10.ControllerIdxSigs,
      count: 3,
      frames: 2,
      n: 46,
    }),
  );
});

test("Should throw if new group starts before previous group is complete", async () => {
  const input = encodeUtf8(
    [
      encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 3 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
      encoding.encodeCounter({ code: CountCode_10.WitnessIdxSigs, count: 2 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
    ].join(""),
  );

  const parser = new Parser({ version: 1 });

  assert.throws(
    () => Array.from(parser.parse(input)),
    new IncompleteGroupParserError({
      code: CountCode_10.ControllerIdxSigs,
      count: 3,
      frames: 2,
      n: 46,
    }),
  );
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

test("Should parse indexed signatures", () => {
  const input = encodeUtf8(
    [
      encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 3 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
      encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
    ].join(""),
  );

  const parser = new Parser({ version: 1 });
  const result = Array.from(parser.parse(input));

  assert.equal(result.length, 4);
  assert.partialDeepStrictEqual(result[0], { code: CountCode_10.ControllerIdxSigs });
  assert.partialDeepStrictEqual(result[1], { code: IndexCode.Ed25519_Big_Sig });
  assert.partialDeepStrictEqual(result[2], { code: IndexCode.Ed25519_Big_Sig });
  assert.partialDeepStrictEqual(result[3], { code: IndexCode.Ed25519_Sig });
});

test("Should throw if counter is ended early", () => {
  const input = encodeUtf8(
    [
      encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 2 }),
      encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
      encoding.encodeCounter({ code: CountCode_10.WitnessIdxSigs, count: 2 }),
      encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
      encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
    ].join(""),
  );

  const parser = new Parser({ version: 1 });
  assert.throws(
    () => Array.from(parser.parse(input)),
    new IncompleteGroupParserError({
      code: CountCode_10.ControllerIdxSigs,
      count: 2,
      frames: 1,
      n: 22,
    }),
  );
});

test("Should switch from version 1 to version 2", () => {
  const input = encodeUtf8(
    [
      encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 1 }),
      encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
      encoding.encodeGenus({ genus: "AAA", major: 2 }),
      encoding.encodeCounter({
        code: CountCode_20.ControllerIdxSigs,
        count: IndexTable[IndexCode.Ed25519_Sig].fs / 4,
      }),
      encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
    ].join(""),
  );

  const parser = new Parser({ version: 1 });
  const result = Array.from(parser.parse(input));

  assert.equal(result.length, 5);
  assert.partialDeepStrictEqual(result[0], { code: CountCode_10.ControllerIdxSigs });
  assert.partialDeepStrictEqual(result[1], { code: IndexCode.Ed25519_Sig });
  assert.partialDeepStrictEqual(result[2], { code: CountCode_10.KERIACDCGenusVersion });
  assert.partialDeepStrictEqual(result[3], { code: CountCode_20.ControllerIdxSigs });
  assert.partialDeepStrictEqual(result[4], { code: IndexCode.Ed25519_Sig });
});

test("Should switch from version 2 to version 1", () => {
  const input = encodeUtf8(
    [
      encoding.encodeCounter({
        code: CountCode_20.ControllerIdxSigs,
        count: IndexTable[IndexCode.Ed25519_Sig].fs / 4,
      }),
      encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
      encoding.encodeGenus({ genus: "AAA", major: 1, minor: 0 }),
      encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 1 }),
      encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
    ].join(""),
  );

  const parser = new Parser({ version: 2 });
  const result = Array.from(parser.parse(input));

  assert.equal(result.length, 5);
  assert.partialDeepStrictEqual(result[0], { code: CountCode_20.ControllerIdxSigs });
  assert.partialDeepStrictEqual(result[1], { code: IndexCode.Ed25519_Sig });
  assert.partialDeepStrictEqual(result[2], { code: CountCode_10.KERIACDCGenusVersion });
  assert.partialDeepStrictEqual(result[3], { code: CountCode_10.ControllerIdxSigs });
  assert.partialDeepStrictEqual(result[4], { code: IndexCode.Ed25519_Sig });
});

test("Should parse attachment group v1", () => {
  const input = encodeUtf8(
    [
      encoding.encodeAttachmentsV1(1 + 23 * 2),
      encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 2 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
    ].join(""),
  );

  const parser = new Parser();
  const result = Array.from(parser.parse(input));

  assert.equal(result.length, 4);
});

test("Should parse JSON after attachment group v1", () => {
  const input = encodeUtf8(
    [
      encoding.encodeAttachmentsV1(1 + 23 * 2),
      encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 2 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
      encoding.encodeMessage({ payload: { message: "foo" }, protocol: "KERI", major: 1 }),
    ].join(""),
  );

  const parser = new Parser({ version: 1 });
  const result = Array.from(parser.parse(input));

  assert.equal(result.length, 5);
});

test("Should parse multiple attachment groups", () => {
  const input = encodeUtf8(
    [
      encoding.encodeAttachmentsV1(1 + 23 * 2),
      encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 2 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
      encoding.encodeAttachmentsV1(1 + 23 * 2),
      encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 2 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 0, ondex: 0 }),
      encoding.encodeIndexer({ code: IndexCode.Ed25519_Big_Sig, raw: randomBytes(64), index: 1, ondex: 0 }),
    ].join(""),
  );

  const parser = new Parser({ version: 1 });
  const result = Array.from(parser.parse(input));

  assert.equal(result.length, 8);
});

test("Should parse transferable idx sig group", () => {
  const input = encodeUtf8(
    [
      "-VA0",
      encoding.encodeCounter({ code: CountCode_10.TransIdxSigGroups, count: 1 }),
      "EL8vpSig7NmSxLJ44QSJozcTVYSqPUHVQWPZtyVmPUO_",
      "0AAAAAAAAAAAAAAAAAAAAAAA",
      "EL8vpSig7NmSxLJ44QSJozcTVYSqPUHVQWPZtyVmPUO_",
      encoding.encodeCounter({ code: CountCode_10.ControllerIdxSigs, count: 1 }),
      encoding.encodeIndexedSignature("ed25519", randomBytes(64), 0),
    ].join(""),
  );

  const parser = new Parser({ version: 1 });
  const result = Array.from(parser.parse(input));

  assert.equal(result.length, 7);
});

test("Should parse grant message attachments", async () => {
  const input = encodeUtf8(
    [
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
    ].join(""),
  );

  const parser = new Parser({ version: 1 });
  const result = Array.from(parser.parse(input));

  assert.equal(result.length, 36);
});
