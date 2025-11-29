import { basename } from "node:path";
import { describe, test } from "node:test";
import assert from "node:assert";
import { Attachments } from "./attachments.ts";
import { Matter } from "./matter.ts";

const [sig0, sig1] = [
  "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
  "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
];

describe(basename(import.meta.url), () => {
  describe("serialization", () => {
    test("should serialize indexed controller signatures", () => {
      const attachments = new Attachments({
        ControllerIdxSigs: [sig0, sig1],
      });

      assert.deepStrictEqual(attachments.text(), ["-VAt", "-AAC", sig0, sig1].join(""));
    });

    test("should serialize controller signatures with seal source", () => {
      const attachments = new Attachments({
        TransIdxSigGroups: [
          {
            prefix: Matter.crypto.blake3_256(new Uint8Array(32)).text(),
            snu: "3",
            digest: Matter.crypto.blake3_256(new Uint8Array(32)).text(),
            ControllerIdxSigs: [sig0, sig1],
          },
        ],
      });

      assert.deepStrictEqual(
        attachments.text(),
        [
          "-VBK",
          "-FAB",
          Matter.crypto.blake3_256(new Uint8Array(32)).text(),
          Matter.primitive.hex("3").text(),
          Matter.crypto.blake3_256(new Uint8Array(32)).text(),
          "-AAC",
          sig0,
          sig1,
        ].join(""),
      );
    });

    test("should serialize controller signatures with last seal source", () => {
      const attachments = new Attachments({
        TransLastIdxSigGroups: [
          {
            prefix: Matter.crypto.blake3_256(new Uint8Array(32)).text(),
            ControllerIdxSigs: [sig0, sig1],
          },
        ],
      });

      assert.deepStrictEqual(
        attachments.text(),
        ["-VA5", "-HAB", Matter.crypto.blake3_256(new Uint8Array(32)).text(), "-AAC", sig0, sig1].join(""),
      );
    });

    test("should serialize indexed witness signatures", () => {
      const attachments = new Attachments({
        WitnessIdxSigs: [sig0, sig1],
      });

      assert.deepStrictEqual(attachments.text(), ["-VAt", "-BAC", sig0, sig1].join(""));
    });

    test("should serialize receipt couples", () => {
      const attachments = new Attachments({
        NonTransReceiptCouples: [
          {
            prefix: "BEZbsFd5_-IEwhnvsaqKvPuTSm9sa9crR_ip7PU1BryR",
            sig: "0BBWy3Amd7MoMXfG30UXr-fg6vChLBvtW0ojQqIdhE373PquVbWl4tHJYMRWbytqETC_bVMRkve9v_C9fCo1KfgN",
          },
        ],
      });

      assert.deepStrictEqual(
        attachments.text(),
        [
          "-VAi",
          "-CAB",
          "BEZbsFd5_-IEwhnvsaqKvPuTSm9sa9crR_ip7PU1BryR",
          "0BBWy3Amd7MoMXfG30UXr-fg6vChLBvtW0ojQqIdhE373PquVbWl4tHJYMRWbytqETC_bVMRkve9v_C9fCo1KfgN",
        ].join(""),
      );
    });

    test("should serialize embedded attachment without group wrapper", () => {
      const attachments = new Attachments({
        PathedMaterialCouples: [
          {
            path: "-a-bc",
            grouped: false,
            attachments: new Attachments({
              ControllerIdxSigs: [sig0],
            }),
          },
        ],
      });

      assert.deepStrictEqual(attachments.text(), ["-VAb", "-LAa", "6AACAAA-a-bc", "-AAB", sig0].join(""));
    });

    test("should serialize embedded attachment with group wrapper", () => {
      const attachments = new Attachments({
        PathedMaterialCouples: [
          {
            path: "-a-bc",
            grouped: true,
            attachments: new Attachments({
              ControllerIdxSigs: [sig0],
            }),
          },
        ],
      });

      assert.deepStrictEqual(attachments.text(), ["-VAc", "-LAb", "6AACAAA-a-bc", "-VAX", "-AAB", sig0].join(""));
    });

    test("should serialize multiple embedded attachments", () => {
      const attachments = new Attachments({
        PathedMaterialCouples: [
          {
            path: "-a-bc",
            grouped: false,
            attachments: new Attachments({
              ControllerIdxSigs: [sig0],
            }),
          },
          {
            path: "x-y-z",
            grouped: false,
            attachments: new Attachments({
              WitnessIdxSigs: [sig1],
            }),
          },
        ],
      });

      assert.deepStrictEqual(
        attachments.text(),
        ["-VA2", "-LAa", "6AACAAA-a-bc", "-AAB", sig0, "-LAa", "6AACAAAx-y-z", "-BAB", sig1].join(""),
      );
    });
  });
});
