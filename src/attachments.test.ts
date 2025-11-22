import { basename } from "node:path";
import { describe, test } from "node:test";
import assert from "node:assert";
import { Attachments } from "./attachments.ts";
import { encodeHexNumber, encodeMatter } from "./encoding.ts";
import { MatterCode } from "./codes.ts";

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
        attachments.toString(),
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
            prefix: encodeMatter({ code: MatterCode.Blake3_256, raw: new Uint8Array(32) }),
            snu: "3",
            digest: encodeMatter({ code: MatterCode.Blake3_256, raw: new Uint8Array(32) }),
            ControllerIdxSigs: [
              "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
              "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
            ],
          },
        ],
      });

      assert.deepStrictEqual(
        attachments.toString(),
        [
          "-FAB",
          encodeMatter({ code: MatterCode.Blake3_256, raw: new Uint8Array(32) }),
          encodeHexNumber("3"),
          encodeMatter({ code: MatterCode.Blake3_256, raw: new Uint8Array(32) }),
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
            prefix: encodeMatter({ code: MatterCode.Blake3_256, raw: new Uint8Array(32) }),
            ControllerIdxSigs: [
              "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
              "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
            ],
          },
        ],
      });

      assert.deepStrictEqual(
        attachments.toString(),
        [
          "-HAB",
          encodeMatter({ code: MatterCode.Blake3_256, raw: new Uint8Array(32) }),
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
        attachments.toString(),
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
        attachments.toString(),
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
        attachments.toString(),
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
        attachments.toString(),
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
