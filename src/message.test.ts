import test, { describe } from "node:test";
import assert from "node:assert";
import { basename } from "node:path";
import { Message } from "./message.ts";
import { VersionString } from "./version-string.ts";
import { Attachments } from "./attachments.ts";
import { encodeUtf8 } from "./encoding-utf8.ts";
import { Indexer } from "./indexer.ts";
import { inspect } from "node:util";

describe(basename(import.meta.url), () => {
  describe("creating messages", () => {
    test("should create message with legacy KERI version", () => {
      const message = new Message({
        v: VersionString.KERI_LEGACY,
        foo: "bar",
      });

      assert.strictEqual(message.body.v, "KERI10JSON000025_");
      assert.strictEqual(message.body.foo, "bar");
    });

    test("should create message with modern KERI version", () => {
      const message = new Message({
        v: VersionString.KERI,
        foo: "bar",
      });

      assert.strictEqual(message.body.v, "KERICAAJSONAAAk.");
      assert.strictEqual(message.body.foo, "bar");
    });

    test("should create message with legacy ACDC version", () => {
      const message = new Message({
        v: VersionString.ACDC_LEGACY,
        data: "value",
      });

      assert.strictEqual(message.version.protocol, "ACDC");
      assert.ok(message.body.v.startsWith("ACDC10JSON"));
      assert.ok(message.body.v.endsWith("_"));
    });

    test("should create message with modern ACDC version", () => {
      const message = new Message({
        v: VersionString.ACDC,
      });

      assert.ok(message.body.v.startsWith("ACDCBAAJSON"));
      assert.ok(message.body.v.endsWith("."));
    });

    test("should create message with custom protocol", () => {
      const message = new Message({
        v: VersionString.encode({
          protocol: "ACDC",
          major: 1,
          minor: 5,
          legacy: true,
        }),
        test: "data",
      });

      assert.ok(message.body.v.startsWith("ACDC"));
    });

    test("should create message with multiple fields", () => {
      const message = new Message({
        v: VersionString.KERI_LEGACY,
        very: "long",
        message: "content",
        with: ["multiple", "fields"],
        and: { nested: "objects" },
      });

      assert.strictEqual(message.body.v, "KERI10JSON000073_");
    });

    test("should create message with empty payload", () => {
      const message = new Message({
        v: VersionString.KERI_LEGACY,
      });

      assert.ok(message.body.v);
      assert.strictEqual(Object.keys(message.body).length, 1);
    });

    test("should recalculate version string size", () => {
      const message = new Message({
        v: "KERI10JSON000042_", // Wrong size
        t: "icp",
        d: "ELvaU6Z-i0d8JJR2nmwyYAfsv0-dn4lMOgPhQq5VXhE",
      });

      assert.ok(message.body.v);
      assert.notStrictEqual(message.body.v, "KERI10JSON000042_");
    });

    test("should produce consistent output for same input", () => {
      const init = {
        v: VersionString.KERI_LEGACY,
        t: "icp",
        d: "ELvaU6Z-i0d8JJR2nmwyYAfsv0-dn4lMOgPhQq5VXhE",
      };

      const message1 = new Message(init);
      const message2 = new Message(init);

      assert.strictEqual(message1.text(), message2.text());
      assert.deepStrictEqual(message1.body, message2.body);
    });
  });

  describe("attachments", () => {
    test("should create message with attachments from constructor", () => {
      const message = new Message(
        {
          v: VersionString.KERI_LEGACY,
          test: "data",
        },
        {
          ControllerIdxSigs: [
            Indexer.crypto.ed25519_sig(new Uint8Array(64), 0).text(),
            Indexer.crypto.ed25519_sig(new Uint8Array(64), 1).text(),
          ],
        },
      );

      assert.strictEqual(message.attachments.ControllerIdxSigs.length, 2);
    });

    test("should allow setting attachments after creation", () => {
      const message = new Message({
        v: VersionString.KERI_LEGACY,
        test: "data",
      });

      const sig = Indexer.crypto.ed25519_sig(new Uint8Array(64), 0).text();

      message.attachments = new Attachments({
        ControllerIdxSigs: [sig],
      });

      assert.strictEqual(message.attachments.ControllerIdxSigs.length, 1);
      assert.strictEqual(message.attachments.ControllerIdxSigs[0], sig);
    });
  });

  describe("serialization", () => {
    test("should serialize message body to JSON", () => {
      const message = new Message({
        v: VersionString.KERI_LEGACY,
        foo: "bar",
      });

      assert.strictEqual(message.text(), JSON.stringify(message.body));
    });

    test("should provide access to raw bytes", () => {
      const message = new Message({
        v: VersionString.KERI_LEGACY,
        test: "data",
      });

      const raw = message.raw;
      assert.ok(raw instanceof Uint8Array);
      assert.ok(raw.length > 0);

      const decoded = new TextDecoder().decode(raw);
      assert.strictEqual(decoded, JSON.stringify(message.body));
    });

    test("should encode legacy version string correctly", () => {
      const message = new Message({
        v: VersionString.KERI_LEGACY,
        a: 1,
      });

      assert.strictEqual(message.text(), '{"v":"KERI10JSON00001f_","a":1}');
    });

    test("should encode modern version string correctly", () => {
      const message = new Message({
        v: VersionString.KERI,
        a: 1,
      });

      assert.strictEqual(message.text(), '{"v":"KERICAAJSONAAAe.","a":1}');
    });
  });

  describe("version properties", () => {
    test("should expose version properties correctly", () => {
      const message = new Message({
        v: new VersionString({
          protocol: "KERI",
          major: 2,
          minor: 3,
          legacy: false,
        }).text,
        a: 1,
      });

      assert.strictEqual(message.version.major, 2);
      assert.strictEqual(message.version.minor, 3);
      assert.strictEqual(message.version.protocol, "KERI");
      assert.strictEqual(message.version.kind, "JSON");
      assert.strictEqual(message.version.legacy, false);
      assert.strictEqual(message.version.size, message.raw.length);
    });

    test("should handle different major and minor versions", () => {
      const message = new Message({
        v: VersionString.encode({
          protocol: "KERI",
          major: 15,
          minor: 9,
          legacy: true,
        }),
        test: "data",
      });

      const versionString = message.body.v as string;
      assert.ok(versionString.includes("f9")); // 15 and 9 in hex
    });
  });

  describe("parsing messages", () => {
    test("should parse message with legacy KERI version", () => {
      const input = encodeUtf8('{"v":"KERI10JSON000027_","test":"data"}');
      const message = Message.parse(input);

      assert.ok(message);
      assert.strictEqual(message.version.protocol, "KERI");
      assert.strictEqual(message.version.major, 1);
      assert.strictEqual(message.version.minor, 0);
      assert.strictEqual(message.version.kind, "JSON");
      assert.strictEqual(message.version.legacy, true);
      assert.strictEqual(message.body.test, "data");
    });

    test("should parse message with modern KERI version", () => {
      const input = encodeUtf8('{"v":"KERICABJSONAAAm.","test":"data"}');
      const message = Message.parse(input);

      assert.ok(message);
      assert.strictEqual(message.version.protocol, "KERI");
      assert.strictEqual(message.version.major, 2);
      assert.strictEqual(message.version.minor, 1);
      assert.strictEqual(message.version.kind, "JSON");
      assert.strictEqual(message.version.legacy, false);
      assert.strictEqual(message.body.test, "data");
    });

    test("should return null for empty input", () => {
      const input = new Uint8Array(0);
      const message = Message.parse(input);

      assert.strictEqual(message, null);
    });

    test("should return null for incomplete message", () => {
      const input = encodeUtf8('{"v":"KERI"}');
      const message = Message.parse(input);

      assert.strictEqual(message, null);
    });

    test("should throw if input does not start with JSON object", () => {
      const input = encodeUtf8("Not a JSON object");

      assert.throws(() => {
        Message.parse(input);
      }, /Expected JSON starting with '{' \(0x7b\), got:/);
    });

    test("should round-trip encode and parse", () => {
      const original = new Message({
        v: VersionString.KERI_LEGACY,
        t: "icp",
        d: "ELvaU6Z-i0d8JJR2nmwyYAfsv0-dn4lMOgPhQq5VXhE",
      });

      const parsed = Message.parse(original.raw);

      assert.ok(parsed);
      assert.deepStrictEqual(parsed.body, original.body);
    });
  });

  describe("error handling", () => {
    test("should throw error for invalid protocol name (too long)", () => {
      assert.throws(() => {
        new Message({
          v: VersionString.KERI.replace("KERI", "TOOLONG"),
        });
      }, /Invalid version string.*TOOLONGCAAJSONAAAA/);
    });

    test("should throw error for invalid protocol name (too short)", () => {
      assert.throws(() => {
        new Message({
          v: VersionString.KERI.replace("KERI", "ABC"),
        });
      }, /Invalid version string.*ABCCAAJSONAAAA/);
    });

    test("should throw error for unsupported message kind", () => {
      assert.throws(() => {
        new Message({
          v: VersionString.KERI.replace("JSON", "CBOR"),
        });
      }, /Unsupported encoding kind.*only JSON format is supported/);
    });
  });

  describe("inspect", () => {
    test("should display code and raw", () => {
      assert.deepStrictEqual(
        inspect(new Message({ v: VersionString.KERI_LEGACY, t: "qry" }), { colors: false }).split("\n"),
        [`Message { body: { v: 'KERI10JSON000023_', t: 'qry' } }`],
      );
    });
  });
});
