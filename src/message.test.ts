import test from "node:test";
import assert from "node:assert";
import { basename } from "node:path";
import { Message } from "./message.ts";
import { VersionString } from "./version-string.ts";
import { Attachments } from "./attachments.ts";

test.describe(basename(import.meta.url), () => {
  test("Should serialize message with attachments", () => {
    const message = new Message({
      v: VersionString.KERI_LEGACY,
      foo: "bar",
    });

    assert.strictEqual(message.encode(), JSON.stringify(message.body.payload) + "-VAA");
  });

  test("Should create message with non-keri protocol", () => {
    const message = new Message({
      v: VersionString.ACDC_LEGACY,
      data: "value",
    });

    assert.strictEqual(message.body.version.protocol, "ACDC");
  });

  test("Should allow setting attachments", () => {
    const message = new Message({
      v: VersionString.KERI_LEGACY,
      test: "data",
    });

    message.attachments = new Attachments({
      ControllerIdxSigs: ["AAtest"],
    });

    assert.strictEqual(message.attachments.ControllerIdxSigs.length, 1);
    assert.strictEqual(message.attachments.ControllerIdxSigs[0], "AAtest");
  });

  test("Should create message with attachments from constructor", () => {
    const message = new Message(
      {
        v: VersionString.KERI_LEGACY,
        test: "data",
      },
      {
        ControllerIdxSigs: ["AAtest", "ABtest"],
      },
    );

    assert.strictEqual(message.attachments.ControllerIdxSigs.length, 2);
  });
});
