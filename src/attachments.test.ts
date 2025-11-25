import { basename } from "node:path";
import { describe, test } from "node:test";
import assert from "node:assert";
import { Attachments } from "./attachments.ts";
import { MatterCode } from "./codes.ts";
import { Matter } from "./matter.ts";

describe(basename(import.meta.url), () => {
  describe("serialization", () => {
    test("should serialize indexed controller signatures", () => {
      const attachments = new Attachments({
        grouped: false,
        ControllerIdxSigs: [
          "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
          "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
        ],
      });

      assert.deepStrictEqual(
        attachments.text(),
        [
          "-AAC",
          "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
          "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
        ].join(""),
      );
    });

    test("should serialize controller signatures with seal source", () => {
      const attachments = new Attachments({
        grouped: false,
        TransIdxSigGroups: [
          {
            prefix: Matter.create.blake3_256(new Uint8Array(32)).text(),
            snu: "3",
            digest: Matter.create.blake3_256(new Uint8Array(32)).text(),
            ControllerIdxSigs: [
              "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
              "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
            ],
          },
        ],
      });

      assert.deepStrictEqual(
        attachments.text(),
        [
          "-FAB",
          Matter.from(MatterCode.Blake3_256, new Uint8Array(32)).text(),
          Matter.create.hex("3").text(),
          Matter.from(MatterCode.Blake3_256, new Uint8Array(32)).text(),
          "-AAC",
          "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
          "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
        ].join(""),
      );
    });

    test("should serialize controller signatures with last seal source", () => {
      const attachments = new Attachments({
        grouped: false,
        TransLastIdxSigGroups: [
          {
            prefix: Matter.from(MatterCode.Blake3_256, new Uint8Array(32)).text(),
            ControllerIdxSigs: [
              "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
              "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
            ],
          },
        ],
      });

      assert.deepStrictEqual(
        attachments.text(),
        [
          "-HAB",
          Matter.create.blake3_256(new Uint8Array(32)).text(),
          "-AAC",
          "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
          "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
        ].join(""),
      );
    });

    test("should serialize indexed witness signatures", () => {
      const attachments = new Attachments({
        grouped: false,
        WitnessIdxSigs: [
          "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
          "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
        ],
      });

      assert.deepStrictEqual(
        attachments.text(),
        [
          "-BAC",
          "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
          "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
        ].join(""),
      );
    });

    test("should serialize receipt couples", () => {
      const attachments = new Attachments({
        grouped: false,
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
          "-CAB",
          "BEZbsFd5_-IEwhnvsaqKvPuTSm9sa9crR_ip7PU1BryR",
          "0BBWy3Amd7MoMXfG30UXr-fg6vChLBvtW0ojQqIdhE373PquVbWl4tHJYMRWbytqETC_bVMRkve9v_C9fCo1KfgN",
        ].join(""),
      );
    });

    test("should serialize single embedded attachment", () => {
      const attachments = new Attachments({
        grouped: false,
        PathedMaterialCouples: [
          {
            path: "-a-bc",
            attachments: new Attachments({
              grouped: false,
              ControllerIdxSigs: [
                "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
              ],
            }),
          },
        ],
      });

      assert.deepStrictEqual(
        attachments.text(),
        [
          "-LAa",
          "6AACAAA-a-bc",
          "-AAB",
          "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
        ].join(""),
      );
    });

    test("should serialize multiple embedded attachments", () => {
      const attachments = new Attachments({
        grouped: false,
        PathedMaterialCouples: [
          {
            path: "-a-bc",
            attachments: new Attachments({
              grouped: false,
              ControllerIdxSigs: [
                "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
              ],
            }),
          },
          {
            path: "x-y-z",
            attachments: new Attachments({
              grouped: false,
              WitnessIdxSigs: [
                "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
              ],
            }),
          },
        ],
      });

      assert.deepStrictEqual(
        attachments.text(),
        [
          "-LAa",
          "6AACAAA-a-bc",
          "-AAB",
          "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
          "-LAa",
          "6AACAAAx-y-z",
          "-BAB",
          "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
        ].join(""),
      );
    });
  });
});
