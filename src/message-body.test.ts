import test from "node:test";
import assert from "node:assert";
import { basename } from "node:path";
import { MessageBody } from "./message-body.ts";
import { encodeUtf8 } from "./encoding-utf8.ts";
import { VersionString } from "./version-string.ts";

test.describe(basename(import.meta.url), () => {
  test("Should create event message with legacy format", () => {
    const message = new MessageBody({
      payload: {
        foo: "bar",
      },
      version: VersionString.KERI_LEGACY,
    });

    assert.partialDeepStrictEqual(message.payload, {
      v: "KERI10JSON000025_",
      foo: "bar",
    });
  });

  test("Should create message with modern version format", () => {
    const message = new MessageBody({
      payload: {
        foo: "bar",
      },
      version: VersionString.KERI,
    });

    assert.partialDeepStrictEqual(message.payload, {
      v: "KERICAAJSONAAAk.",
      foo: "bar",
    });
  });

  test("Should serialize event", () => {
    const message = new MessageBody({
      payload: {
        foo: "bar",
      },
      version: VersionString.KERI_LEGACY,
    });

    assert.strictEqual(message.text, JSON.stringify(message.payload));
  });

  test.describe("Message version properties", () => {
    test("Should expose version properties", () => {
      const message = new MessageBody({
        payload: { a: 1 },
        version: {
          protocol: "KERI",
          major: 2,
          minor: 3,
          legacy: false,
        },
      });

      assert.strictEqual(message.version.major, 2);
      assert.strictEqual(message.version.minor, 3);
      assert.strictEqual(message.version.protocol, "KERI");
      assert.strictEqual(message.version.kind, "JSON");
      assert.strictEqual(message.version.legacy, false);
      assert.strictEqual(message.version.size, message.size);
    });
  });

  test.describe("Encode version string via Message constructor", () => {
    test("Should encode legacy version string for ACDC protocol", () => {
      const message = new MessageBody({
        payload: {},
        version: VersionString.ACDC_LEGACY,
      });

      assert.ok(message.payload.v.startsWith("ACDC10JSON"));
      assert.ok(message.payload.v.endsWith("_"));
    });

    test("Should encode modern version string for ACDC protocol", () => {
      const message = new MessageBody({
        payload: {},
        version: VersionString.ACDC,
      });

      assert.ok(message.payload.v.startsWith("ACDCBAAJSON"));
      assert.ok(message.payload.v.endsWith("."));
    });

    test("Should add legacy version to object", () => {
      const message = new MessageBody({
        payload: { a: 1 },
        version: VersionString.KERI_LEGACY,
      });

      assert.strictEqual(message.text, '{"v":"KERI10JSON00001f_","a":1}');
    });

    test("Should add modern version to object", () => {
      const message = new MessageBody({
        payload: { a: 1 },
        version: VersionString.KERI,
      });

      assert.strictEqual(message.text, '{"v":"KERICAAJSONAAAe.","a":1}');
    });
  });

  test.describe("Parse message via Message.parseBody", () => {
    test("Should parse legacy KERI version", () => {
      // PPPPvvKKKKllllll_
      const input = encodeUtf8('{"v":"KERI10JSON000027_","test":"data"}');
      const message = MessageBody.parse(input);

      assert.ok(message);
      assert.strictEqual(message.version.protocol, "KERI");
      assert.strictEqual(message.version.major, 1);
      assert.strictEqual(message.version.minor, 0);
      assert.strictEqual(message.version.kind, "JSON");
      assert.strictEqual(message.version.legacy, true);
    });

    test("Should parse modern KERI version", () => {
      // PPPPVVVKKKKBBBB.
      // Create a complete message with version 2.1
      const input = encodeUtf8('{"v":"KERICABJSONAAAm.","test":"data"}');
      const message = MessageBody.parse(input);

      assert.ok(message);
      assert.strictEqual(message.version.protocol, "KERI");
      assert.strictEqual(message.version.major, 2);
      assert.strictEqual(message.version.minor, 1);
      assert.strictEqual(message.version.kind, "JSON");
      assert.strictEqual(message.version.legacy, false);
    });

    test("Should return null for empty input", () => {
      const input = new Uint8Array(0);
      const message = MessageBody.parse(input);

      assert.strictEqual(message, null);
    });

    test("Should return null for incomplete message", () => {
      const input = encodeUtf8('{"v":"KERI"}');
      const message = MessageBody.parse(input);

      assert.strictEqual(message, null);
    });

    test("Should throw if input does not start with JSON object", () => {
      const input = encodeUtf8("Not a JSON object");
      assert.throws(() => {
        MessageBody.parse(input);
      }, /Expected JSON starting with '{' \(0x7b\), got:/);
    });
  });

  test("Should handle different protocol names", () => {
    const message = new MessageBody({
      payload: { test: "data" },
      version: {
        protocol: "ACDC",
        major: 1,
        minor: 5,
        legacy: true,
      },
    });

    assert.ok(message.payload.v.startsWith("ACDC"));
  });

  test("Should create message with multiple fields", () => {
    const message = new MessageBody({
      payload: {
        very: "long",
        message: "content",
        with: ["multiple", "fields"],
        and: { nested: "objects" },
      },
      version: VersionString.KERI_LEGACY,
    });

    assert.strictEqual(message.payload.v, "KERI10JSON000073_");
  });

  test("Should preserve payload properties", () => {
    const originalPayload = {
      t: "rot",
      d: "ELvaU6Z-i0d8JJR2nmwyYAfsv0-dn4lMOgPhQq5VXhE",
      i: "EAoTNZH3ULvaU6Z-i0d8JJR2nmwyYAfsv0-dn4lMO",
      s: "1",
      p: "ELvaU6Z-i0d8JJR2nmwyYAfsv0-dn4lMOgPhQq5VXhE",
      kt: "1",
      k: ["DaU6JR2nmwyZ-i0d8JvaU6Z-i0d8JJR2nmwyYAfsv0-dn4lMOgPhQq5VXhE"],
      nt: "1",
      n: ["EZ-i0d8JJR2nmwyYAfsv0-dn4lMOgPhQq5VXhEAoTNZH3ULvaU6"],
      bt: "0",
      b: [],
      c: [],
      a: [],
    };

    const message = new MessageBody({
      payload: originalPayload,
      version: VersionString.KERI_LEGACY,
    });

    for (const [key, value] of Object.entries(originalPayload)) {
      assert.deepStrictEqual(message.payload[key], value, `Property ${key} should be preserved`);
    }
  });

  test("Should handle empty payload", () => {
    const message = new MessageBody({
      payload: {},
      version: VersionString.KERI_LEGACY,
    });

    const payload = message.payload;
    assert.ok(payload.v);
    assert.strictEqual(Object.keys(payload).length, 1); // Only version string
  });

  test("Should throw error for invalid protocol", () => {
    assert.throws(() => {
      new MessageBody({
        payload: { test: "data" },
        version: {
          protocol: "TOOLONG", // Too long
          major: 1,
          minor: 0,
        },
      });
    }, /Protocol must be 4 uppercase characters/);

    assert.throws(() => {
      new MessageBody({
        payload: { test: "data" },
        version: {
          protocol: "ABC", // Too short
          major: 1,
          minor: 0,
        },
      });
    }, /Protocol must be 4 uppercase characters/);
  });

  test("Should throw error for unsupported message kind", () => {
    assert.throws(() => {
      new MessageBody({
        payload: { test: "data" },
        version: {
          protocol: "KERI",
          major: 1,
          minor: 0,
          kind: "CBOR", // Unsupported format
        },
      });
    }, /Only JSON format is supported for now/);
  });

  test("Should handle version string in payload", () => {
    const message = new MessageBody({
      payload: {
        v: "KERI10JSON000042_",
        t: "icp",
        d: "ELvaU6Z-i0d8JJR2nmwyYAfsv0-dn4lMOgPhQq5VXhE",
      },
      version: {
        protocol: "KERI",
        major: 1,
        minor: 0,
        legacy: true,
      },
    });

    assert.ok(message.payload.v);
    assert.notStrictEqual(message.payload.v, "KERI10JSON000042_");
  });

  test("Should produce consistent output for same input", () => {
    const init = {
      payload: {
        t: "icp",
        d: "ELvaU6Z-i0d8JJR2nmwyYAfsv0-dn4lMOgPhQq5VXhE",
      },
      protocol: "KERI",
      major: 1,
      minor: 0,
      legacy: true,
    };

    const message1 = new MessageBody(init);
    const message2 = new MessageBody(init);

    assert.strictEqual(message1.toString(), message2.toString());
    assert.deepStrictEqual(message1.payload, message2.payload);
  });

  test("Should handle different major/minor versions", () => {
    const message = new MessageBody({
      payload: { test: "data" },
      version: {
        protocol: "KERI",
        major: 15, // Max single digit hex
        minor: 9, // Max single digit hex
        legacy: true,
      },
    });

    const versionString = message.payload.v as string;
    assert.ok(versionString.includes("f9")); // 15 and 9 in hex
  });

  test("Should provide access to raw bytes", () => {
    const message = new MessageBody({
      payload: { test: "data" },
      version: {
        protocol: "KERI",
        major: 1,
        minor: 0,
        legacy: true,
      },
    });

    const raw = message.raw;
    assert.ok(raw instanceof Uint8Array);
    assert.ok(raw.length > 0);

    const decoded = new TextDecoder().decode(raw);
    assert.strictEqual(decoded, JSON.stringify(message.payload));
  });
});
