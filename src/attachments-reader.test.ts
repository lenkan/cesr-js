import test, { describe } from "node:test";
import assert from "node:assert";
import path from "node:path";
import { encodeUtf8 } from "./encoding-utf8.ts";
import { concat } from "./array-utils.ts";
import { Attachments } from "./attachments.ts";
import { AttachmentsReader } from "./attachments-reader.ts";

const [sig0, sig1, sig2, sig3] = [
  "AABAMwd_6GLRwk6UYU2CQ_DKakLZ8Qz0KyaZllbOmlU8zAhx5iFCHVdyzgDpffiKDXzfHhOWHZzzcxrzpJDEwSs2",
  "ABBoBFc4fyF0LSwfRSFDkhPeseALom_hhxz_Ks2zyAHy1X24zQFw4sT45g4EjSh5HlwKnj95ieJa8N_9955YpP1H",
  "ACDn3T3X2gz4lAYSC1FOU24FMqW-z-a-HSLSyIOCDAgqG9z4J2rEMsUxiMpqGcA7h2OL8fpmBiRwxcexsR9Q_J53",
  "ADCnYmsqVe2CBLrA5CJsVcmi7wcqaS6GrN8Pxk111arhKj2u4llFFQQK9Ym9qt5cZbKchkzNUOYJK_z9VCUnBDh6",
];

const [nsig0, nsig1] = [
  "0BBFyd2ivgH3zzqb8ScCY1X9QZWJl3D0Yhjb0Ij7v5hpcx4k0yYgH1alhRkqlVOCuJowkDb0YTYOLcp5aunXXUhl",
  "0BCljd0hxs39hJGo2cTlAd8iZhsfOYrTh7LgO5mTWajoL2DUDvkdQ3oRXUuHEsSTYqhZUvORnCL38C1Jydk6BvQx",
];

const prefix = "EALkveIFUPvt38xhtgYYJRCCpAGO7WjjHVR37Pawv67E";
const digest = "EBabiu_JCkE0GbiglDXNB5C4NQq-hiGgxhHKXBxkiojg";

describe(path.parse(import.meta.filename).base, () => {
  describe("reading individual attachment types", () => {
    test("should read empty attachment group", () => {
      const attachments = new Attachments({});
      const input = attachments.encode();
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert(result);
      assert.strictEqual(result.text(), "-VAA");
    });

    test("should read ControllerIdxSigs", () => {
      const attachments = new Attachments({
        ControllerIdxSigs: [sig0, sig1],
      });
      const input = attachments.encode();
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert(result);
      assert.strictEqual(result.ControllerIdxSigs.length, 2);
      assert.deepStrictEqual(result.ControllerIdxSigs, [sig0, sig1]);
    });

    test("should read WitnessIdxSigs", () => {
      const attachments = new Attachments({
        WitnessIdxSigs: [sig0, sig1],
      });
      const input = attachments.encode();
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert(result);
      assert.strictEqual(result.WitnessIdxSigs.length, 2);
      assert.deepStrictEqual(result.WitnessIdxSigs, [sig0, sig1]);
    });

    test("should read NonTransReceiptCouples", () => {
      const attachments = new Attachments({
        NonTransReceiptCouples: [
          { prefix: prefix, sig: nsig0 },
          { prefix: prefix, sig: nsig1 },
        ],
      });
      const input = attachments.encode();
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert(result);
      assert.strictEqual(result.NonTransReceiptCouples?.length, 2);
      assert.deepStrictEqual(result.NonTransReceiptCouples, [
        { prefix: prefix, sig: nsig0 },
        { prefix: prefix, sig: nsig1 },
      ]);
    });

    test("should read FirstSeenReplayCouples", () => {
      const date1 = new Date("2024-11-20T10:30:00Z");
      const date2 = new Date("2024-11-20T11:00:00Z");

      const attachments = new Attachments({
        FirstSeenReplayCouples: [
          { fnu: "1", dt: date1 },
          { fnu: "2", dt: date2 },
        ],
      });
      const input = attachments.encode();
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert(result);
      assert.strictEqual(result.FirstSeenReplayCouples?.length, 2);
      assert.strictEqual(result.FirstSeenReplayCouples[0].fnu, "1");
      assert.strictEqual(result.FirstSeenReplayCouples[1].fnu, "2");
      assert.deepStrictEqual(result.FirstSeenReplayCouples[0].dt, date1);
      assert.deepStrictEqual(result.FirstSeenReplayCouples[1].dt, date2);
    });

    test("should read SealSourceCouples", () => {
      const attachments = new Attachments({
        SealSourceCouples: [
          { snu: "5", digest: digest },
          { snu: "a", digest: digest },
        ],
      });
      const input = attachments.encode();
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert(result);
      assert.strictEqual(result.SealSourceCouples?.length, 2);
      assert.deepStrictEqual(result.SealSourceCouples, [
        { snu: "5", digest: digest },
        { snu: "a", digest: digest },
      ]);
    });

    test("should read SealSourceTriples", () => {
      const attachments = new Attachments({
        SealSourceTriples: [
          { prefix: prefix, snu: "3", digest: digest },
          { prefix: prefix, snu: "7", digest: digest },
        ],
      });
      const input = attachments.encode();
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert(result);
      assert.strictEqual(result.SealSourceTriples?.length, 2);
      assert.deepStrictEqual(result.SealSourceTriples, [
        { prefix: prefix, snu: "3", digest: digest },
        { prefix: prefix, snu: "7", digest: digest },
      ]);
    });

    test("should read TransIdxSigGroups", () => {
      const attachments = new Attachments({
        TransIdxSigGroups: [
          {
            prefix: prefix,
            snu: "5",
            digest: digest,
            ControllerIdxSigs: [sig0, sig1],
          },
          {
            prefix: prefix,
            snu: "6",
            digest: digest,
            ControllerIdxSigs: [sig2, sig3],
          },
        ],
      });
      const input = attachments.encode();
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert(result);
      assert.strictEqual(result.TransIdxSigGroups?.length, 2);
      assert.strictEqual(result.TransIdxSigGroups[0].prefix, prefix);
      assert.strictEqual(result.TransIdxSigGroups[0].snu, "5");
      assert.strictEqual(result.TransIdxSigGroups[0].digest, digest);
      assert.deepStrictEqual(result.TransIdxSigGroups[0].ControllerIdxSigs, [sig0, sig1]);
      assert.strictEqual(result.TransIdxSigGroups[1].snu, "6");
      assert.deepStrictEqual(result.TransIdxSigGroups[1].ControllerIdxSigs, [sig2, sig3]);
    });

    test("should read TransLastIdxSigGroups", () => {
      const attachments = new Attachments({
        TransLastIdxSigGroups: [
          {
            prefix: prefix,
            ControllerIdxSigs: [sig0, sig1],
          },
          {
            prefix: prefix,
            ControllerIdxSigs: [sig2],
          },
        ],
      });
      const input = attachments.encode();
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert(result);
      assert.strictEqual(result.TransLastIdxSigGroups?.length, 2);
      assert.strictEqual(result.TransLastIdxSigGroups[0].prefix, prefix);
      assert.deepStrictEqual(result.TransLastIdxSigGroups[0].ControllerIdxSigs, [sig0, sig1]);
      assert.strictEqual(result.TransLastIdxSigGroups[1].prefix, prefix);
      assert.deepStrictEqual(result.TransLastIdxSigGroups[1].ControllerIdxSigs, [sig2]);
    });

    test("should read PathedMaterialCouples", () => {
      const nestedAttachments = new Attachments({
        ControllerIdxSigs: [sig0],
      });

      const attachments = new Attachments({
        PathedMaterialCouples: [
          { path: "-a-b", attachments: nestedAttachments },
          { path: "-c", attachments: nestedAttachments },
        ],
      });
      const input = attachments.encode();
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert(result);
      assert.strictEqual(result.PathedMaterialCouples?.length, 2);
      assert.strictEqual(result.PathedMaterialCouples[0].path, "-a-b");
      assert.strictEqual(result.PathedMaterialCouples[1].path, "-c");
    });

    test("should read ungrouped PathedMaterialCouples", () => {
      const attachments = new Attachments({
        PathedMaterialCouples: [
          {
            path: "-a-b",
            attachments: {
              grouped: false,
              ControllerIdxSigs: [sig0],
            },
          },
          { path: "-c", attachments: { grouped: false, ControllerIdxSigs: [sig0] } },
        ],
      });
      const input = attachments.encode();
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert(result);
      assert.strictEqual(result.PathedMaterialCouples?.length, 2);
      assert.strictEqual(result.PathedMaterialCouples[0].path, "-a-b");
      assert.strictEqual(result.PathedMaterialCouples[1].path, "-c");
    });

    test("should read ungrouped attachment", () => {
      const attachments = new Attachments({ grouped: false, ControllerIdxSigs: [sig0] });
      const input = attachments.encode();
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert(result);
      assert.strictEqual(result.ControllerIdxSigs.length, 1);
      assert.strictEqual(result.grouped, false);
    });
  });

  describe("reading multiple attachment types", () => {
    test("should read ControllerIdxSigs and WitnessIdxSigs together", () => {
      const attachments = new Attachments({
        ControllerIdxSigs: [sig0],
        WitnessIdxSigs: [sig1],
      });
      const input = attachments.encode();
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert(result);
      assert.strictEqual(result.ControllerIdxSigs.length, 1);
      assert.strictEqual(result.WitnessIdxSigs.length, 1);
      assert.deepStrictEqual(result.ControllerIdxSigs, [sig0]);
      assert.deepStrictEqual(result.WitnessIdxSigs, [sig1]);
    });

    test("should read all attachment types together", () => {
      const attachments = new Attachments({
        ControllerIdxSigs: [sig0],
        WitnessIdxSigs: [sig1],
        NonTransReceiptCouples: [{ prefix: prefix, sig: nsig0 }],
        SealSourceCouples: [{ snu: "3", digest: digest }],
        TransIdxSigGroups: [
          {
            prefix: prefix,
            snu: "5",
            digest: digest,
            ControllerIdxSigs: [sig3],
          },
        ],
      });
      const input = attachments.encode();
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert(result);
      assert.strictEqual(result.ControllerIdxSigs.length, 1);
      assert.strictEqual(result.WitnessIdxSigs.length, 1);
      assert.strictEqual(result.NonTransReceiptCouples?.length, 1);
      assert.strictEqual(result.SealSourceCouples?.length, 1);
      assert.strictEqual(result.TransIdxSigGroups?.length, 1);
    });
  });

  describe("handling incomplete data", () => {
    test("should return null for incomplete attachment group", () => {
      const attachments = new Attachments({
        ControllerIdxSigs: [sig0, sig1],
      });
      const input = attachments.encode().slice(0, -5);
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert.strictEqual(result, null);
    });

    test("should return null for incomplete ControllerIdxSigs", () => {
      const attachments = new Attachments({
        ControllerIdxSigs: [sig0, sig1],
      });

      // Removes the last signature from the encoded attachments
      const input = encodeUtf8(
        attachments
          .frames()
          .slice(0, -1)
          .reduce((a, b) => a + b.text(), ""),
      );
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert.strictEqual(result, null);
    });

    test("should return null for incomplete NonTransReceiptCouples", () => {
      const attachments = new Attachments({
        NonTransReceiptCouples: [{ prefix: prefix, sig: nsig0 }],
      });

      // Remove the signature part of the couple
      const frames = attachments.frames();
      const input = encodeUtf8(frames.slice(0, -1).reduce((a, b) => a + b.text(), ""));
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert.strictEqual(result, null);
    });

    test("should return null for incomplete FirstSeenReplayCouples", () => {
      const attachments = new Attachments({
        FirstSeenReplayCouples: [{ dt: new Date(), fnu: "0" }],
      });

      // Remove the signature part of the couple
      const frames = attachments.frames();
      const input = frames.slice(0, -1).reduce((a, b) => a + b.text(), "");
      const reader = new AttachmentsReader(encodeUtf8(input));

      const result = reader.readAttachments();

      assert.strictEqual(result, null);
    });

    test("should return null for incomplete TransIdxSigGroups", () => {
      const attachments = new Attachments({
        TransIdxSigGroups: [
          {
            prefix: prefix,
            snu: "5",
            digest: digest,
            ControllerIdxSigs: [sig0, sig1],
          },
        ],
      });

      // Remove part of the nested ControllerIdxSigs
      const frames = attachments.frames();
      const input = encodeUtf8(frames.slice(0, -1).reduce((a, b) => a + b.text(), ""));
      const reader = new AttachmentsReader(input);

      const result = reader.readAttachments();

      assert.strictEqual(result, null);
    });

    test("should return null for empty input", () => {
      const reader = new AttachmentsReader(new Uint8Array(0));

      const result = reader.readAttachments();

      assert.strictEqual(result, null);
    });
  });

  describe("edge cases", () => {
    test("should handle multiple reads from same reader", () => {
      const attachments1 = new Attachments({ ControllerIdxSigs: [sig0] });
      const attachments2 = new Attachments({ WitnessIdxSigs: [sig1] });

      const combined = concat(attachments1.encode(), attachments2.encode());
      const reader = new AttachmentsReader(combined);

      const result1 = reader.readAttachments();
      const result2 = reader.readAttachments();

      assert(result1);
      assert(result2);
      assert.strictEqual(result1.ControllerIdxSigs.length, 1);
      assert.strictEqual(result2.WitnessIdxSigs.length, 1);
    });

    test("should throw for invalid counter code", () => {
      const input = encodeUtf8("-XXX");
      const reader = new AttachmentsReader(input);

      assert.throws(() => {
        reader.readAttachments();
      }, /Unsupported group code -X/);
    });
  });
});
