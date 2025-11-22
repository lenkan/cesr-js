import test from "node:test";
import assert from "node:assert";
import { basename } from "node:path";
import { Message } from "./message.ts";
import { VersionString } from "./version-string.ts";
import { Attachments } from "./attachments.ts";

test.describe(basename(import.meta.url), () => {
  test("Should serialize message with attachments", () => {
    const message = new Message({
      payload: {
        foo: "bar",
      },
      version: VersionString.KERI_LEGACY,
    });

    assert.strictEqual(message.toString(), JSON.stringify(message.body.payload) + "-VAA");
  });

  test("Should create message with non-keri protocol", () => {
    const message = new Message({
      payload: {
        data: "value",
      },
      version: {
        protocol: "ACDC",
        legacy: true,
      },
    });

    assert.strictEqual(message.body.version.protocol, "ACDC");
  });

  test("Should allow setting attachments", () => {
    const message = new Message({
      payload: { test: "data" },
      version: VersionString.KERI_LEGACY,
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
        payload: { test: "data" },
        version: VersionString.KERI_LEGACY,
      },
      {
        ControllerIdxSigs: ["AAtest", "ABtest"],
      },
    );

    assert.strictEqual(message.attachments.ControllerIdxSigs.length, 2);
  });
});
