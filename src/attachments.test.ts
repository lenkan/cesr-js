import { describe, test } from "node:test";
import assert from "node:assert";
import { Attachments } from "./attachments.ts";
import { encodeCounter, encodeHexNumber, encodeMatter } from "./encoding.ts";
import { MatterCode } from "./codes.ts";

test("Should serialize indexed controller signatures", () => {
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

test("Should serialize controller signatures with seal source", () => {
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

test("Should serialize controller signatures with last seal source", () => {
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

test("Should serialize indexed witness signatures", () => {
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

test("Should serialize receipt couples", () => {
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

test("Should serialize single embedded attachment", () => {
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

test("Should serialize multiple embedded attachments", () => {
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
          WitnessIdxSigs: ["ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD"],
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

describe("Attachments.fromFrames", () => {
  test("Should build Attachments from ControllerIdxSigs frames", () => {
    const original = new Attachments({
      grouped: true,
      ControllerIdxSigs: [
        "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
        "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
      ],
    });

    const frames = original.frames();
    const reconstructed = Attachments.fromFrames(frames, 1);

    assert.ok(reconstructed);
    assert.strictEqual(reconstructed.ControllerIdxSigs.length, 2);
    assert.deepStrictEqual(reconstructed.ControllerIdxSigs, original.ControllerIdxSigs);
    assert.strictEqual(reconstructed.toString(), original.toString());
  });

  test("Should build Attachments from WitnessIdxSigs frames", () => {
    const original = new Attachments({
      grouped: true,
      WitnessIdxSigs: ["AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP"],
    });

    const frames = original.frames();
    const reconstructed = Attachments.fromFrames(frames, 1);

    assert.ok(reconstructed);
    assert.strictEqual(reconstructed.WitnessIdxSigs.length, 1);
    assert.deepStrictEqual(reconstructed.WitnessIdxSigs, original.WitnessIdxSigs);
  });

  test("Should build Attachments from TransIdxSigGroups frames", () => {
    const original = new Attachments({
      grouped: true,
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

    const frames = original.frames();
    const reconstructed = Attachments.fromFrames(frames, 1);

    assert.ok(reconstructed);
    assert.strictEqual(reconstructed.TransIdxSigGroups.length, 1);
    assert.strictEqual(reconstructed.TransIdxSigGroups[0].prefix, original.TransIdxSigGroups[0].prefix);
    assert.strictEqual(reconstructed.TransIdxSigGroups[0].snu, original.TransIdxSigGroups[0].snu);
    assert.strictEqual(reconstructed.TransIdxSigGroups[0].digest, original.TransIdxSigGroups[0].digest);
    assert.deepStrictEqual(
      reconstructed.TransIdxSigGroups[0].ControllerIdxSigs,
      original.TransIdxSigGroups[0].ControllerIdxSigs,
    );
  });

  test("Should build Attachments from multiple TransIdxSigGroups frames", () => {
    const original = new Attachments({
      grouped: true,
      TransIdxSigGroups: [
        {
          prefix: encodeMatter({ code: MatterCode.Blake3_256, raw: new Uint8Array(32) }),
          snu: "1",
          digest: encodeMatter({ code: MatterCode.Blake3_256, raw: new Uint8Array(32) }),
          ControllerIdxSigs: [
            "AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP",
          ],
        },
        {
          prefix: encodeMatter({ code: MatterCode.Blake3_256, raw: new Uint8Array(32).fill(1) }),
          snu: "2",
          digest: encodeMatter({ code: MatterCode.Blake3_256, raw: new Uint8Array(32).fill(2) }),
          ControllerIdxSigs: [
            "ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD",
          ],
        },
      ],
    });

    const frames = original.frames();
    const reconstructed = Attachments.fromFrames(frames, 1);

    assert.ok(reconstructed);
    assert.strictEqual(reconstructed.TransIdxSigGroups.length, 2);
    assert.strictEqual(reconstructed.TransIdxSigGroups[0].snu, "1");
    assert.strictEqual(reconstructed.TransIdxSigGroups[1].snu, "2");
  });

  test("Should build Attachments from SealSourceCouples frames", () => {
    const original = new Attachments({
      grouped: true,
      SealSourceCouples: [
        {
          snu: "1",
          digest: encodeMatter({ code: MatterCode.Blake3_256, raw: new Uint8Array(32) }),
        },
        {
          snu: "2",
          digest: encodeMatter({ code: MatterCode.Blake3_256, raw: new Uint8Array(32).fill(1) }),
        },
      ],
    });

    const frames = original.frames();
    const reconstructed = Attachments.fromFrames(frames, 1);

    assert.ok(reconstructed);
    assert.strictEqual(reconstructed.SealSourceCouples.length, 2);
    assert.deepStrictEqual(reconstructed.SealSourceCouples, original.SealSourceCouples);
  });

  test("Should build Attachments from SealSourceTriples frames", () => {
    const original = new Attachments({
      grouped: true,
      SealSourceTriples: [
        {
          prefix: encodeMatter({ code: MatterCode.Blake3_256, raw: new Uint8Array(32) }),
          snu: "1",
          digest: encodeMatter({ code: MatterCode.Blake3_256, raw: new Uint8Array(32).fill(1) }),
        },
      ],
    });

    const frames = original.frames();
    const reconstructed = Attachments.fromFrames(frames, 1);

    assert.ok(reconstructed);
    assert.strictEqual(reconstructed.SealSourceTriples.length, 1);
    assert.deepStrictEqual(reconstructed.SealSourceTriples, original.SealSourceTriples);
  });

  test("Should build Attachments from mixed attachment types", () => {
    const original = new Attachments({
      grouped: true,
      ControllerIdxSigs: ["AACo9sQ34vV5dvKDn9_XT7aqXjYrQUcIXsciy84D8LslsvJTYA5X0czckvo30fSgbleGeSYRjWoDuPIyizJpOPUP"],
      WitnessIdxSigs: ["ABCOpOupeb-jKCZ5geaN-qDAE0I-nNb5QWxN0UonZdpjluAQMLgWzSErlP8dE2MqzL_ScIl885AjgHN_FLSN3xgD"],
    });

    const frames = original.frames();
    const reconstructed = Attachments.fromFrames(frames, 1);

    assert.ok(reconstructed);
    assert.strictEqual(reconstructed.ControllerIdxSigs.length, 1);
    assert.strictEqual(reconstructed.WitnessIdxSigs.length, 1);
    assert.strictEqual(reconstructed.toString(), original.toString());
  });

  test("Should return null for empty frames array", () => {
    const reconstructed = Attachments.fromFrames([], 1);
    assert.strictEqual(reconstructed, null);
  });

  test("Should return null for non-attachment group frames", () => {
    const frames = [
      encodeCounter({
        code: "-A",
        count: 1,
      }),
    ];

    const reconstructed = Attachments.fromFrames(frames, 1);
    assert.strictEqual(reconstructed, null);
  });
});
