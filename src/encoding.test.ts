import test, { describe } from "node:test";
import { encoding } from "./encoding.ts";
import assert from "node:assert/strict";
import { encodeUtf8 } from "./encoding-utf8.ts";
import { CountCode_10, CountCode_20 } from "./codes.ts";

describe("Encode", () => {
  test("should throw if raw does not have enough bytes", () => {
    assert.throws(() => {
      encoding.encodeMatter({ code: "0B", raw: new Uint8Array(63) });
    }, new Error("Encoded size 86 does not match expected size 88"));
  });
});

describe("Encode number", () => {
  function t(value: number, expected: string) {
    return [`Should encode ${value}`, () => assert.strictEqual(encoding.encodeNumber(value), expected)] as const;
  }

  test(...t(0, "6HABAAA0"));
  test(...t(-0, "6HABAAA0"));
  test(...t(0.1, "4HABA0p1"));
  test(...t(1, "6HABAAA1"));
  test(...t(123, "4HABA123"));
  test(...t(1.1, "4HABA1p1"));
  test(...t(-1.1, "4HAB-1p1"));
  test(...t(12345678, "4HAC12345678"));
  test(...t(Number.MAX_SAFE_INTEGER, "4HAE9007199254740991"));
});

describe("Encode string", () => {
  function t(value: string, expected: string) {
    return [`Should encode ${value}`, () => assert.strictEqual(encoding.encodeString(value), expected)] as const;
  }

  test(...t("abc", "4AABAabc"));
  test(...t("Foobar", "5AACAAFoobar"));
  test(...t("Foobars", "4AACAFoobars"));

  // Non base64
  test(...t("ABC", "4BABQUJD")); // Cannot start with A for base64
  test(...t("Hello World!", "4BAESGVsbG8gV29ybGQh"));
  test(...t("Foobars!", "6BAEAAAEZvb2JhcnMh"));
  test(...t("-a-b-c", "5AACAA-a-b-c"));
  test(...t("-a-abc", "5AACAA-a-abc"));
  test(...t("-a-abcdef", "6AADAAA-a-abcdef"));
  test(...t("-A-ABC-c", "4AAC-A-ABC-c"));
});

describe("Encode date", () => {
  test("cesr date", () => {
    const result = encoding.encodeDate(new Date(Date.parse("2024-11-23T16:02:27.123Z")));
    assert.equal(result, "1AAG2024-11-23T16c02c27d123000p00c00");
  });
});

describe("CESR Native message", () => {
  test("should encode an empty message", () => {
    const result = encoding.encodeMap({});
    assert.strictEqual(result, "-IAA");
  });

  test("should encode single decimal field value", () => {
    const result = encoding.encodeMap({ a: 1 });
    assert.strictEqual(result, "-IAD0J_a6HABAAA1");
  });

  test("should encode boolean field value", () => {
    const result = encoding.encodeMap({ a: true, b: false });
    assert.strictEqual(result, "-IAE0J_a1AAM0J_b1AAL");
  });

  test("should encode nested field value", () => {
    const result = encoding.encodeMap({ a: { b: false } });
    assert.strictEqual(result, "-IAE0J_a-IAC0J_b1AAL");
  });

  test("should encode string field value", () => {
    const result = encoding.encodeMap({ a: "foobar" });
    assert.strictEqual(result, "-IAE0J_a5AACAAfoobar");
  });

  test("should encode multiple decimal fields", () => {
    const result = encoding.encodeMap({
      a: 1,
      b: 1.1,
    });

    assert.strictEqual(result, ["-IAG", "0J_a", "6HABAAA1", "0J_b", "4HABA1p1"].join(""));
  });

  test("should encode single decimal field with decimal", () => {
    const result = encoding.encodeMap({
      a: 1.1,
    });

    assert.strictEqual(result, "-IAD0J_a4HABA1p1");
  });
});

describe("Encode JSON message", () => {
  test("Should encode legacy version string", () => {
    const result = encoding.encodeVersionString({ protocol: "ACDC", legacy: true });
    assert.strictEqual(result, "ACDC10JSON000000_");
  });

  test("Should encode version string", () => {
    const result = encoding.encodeVersionString({ protocol: "ACDC" });
    assert.strictEqual(result, "ACDCBAAJSONAAAA.");
  });

  test("Should add legacy version to object", () => {
    const result = encoding.encodeMessage({ a: 1 }, { legacy: true });

    assert.strictEqual(result, '{"v":"KERI10JSON00001f_","a":1}');
  });

  test("Should add version to object", () => {
    const result = encoding.encodeMessage({ a: 1 });
    assert.strictEqual(result, '{"v":"KERIBAAJSONAAAe.","a":1}');
  });
});

describe("Decode message", () => {
  test("Should parse legacy keri version", () => {
    // PPPPvvKKKKllllll_
    const result = encoding.decodeVersionString(encodeUtf8(JSON.stringify({ v: "KERI10JSON00000a_" })));
    assert.deepStrictEqual(result, {
      protocol: "KERI",
      major: 1,
      minor: 0,
      kind: "JSON",
      size: 10,
      legacy: true,
    });
  });

  test("Should parse keri version", () => {
    // PPPPVVVKKKKBBBB.
    const result = encoding.decodeVersionString(encodeUtf8(JSON.stringify({ v: "KERICABJSONAAAB." })));
    assert.deepStrictEqual(result, {
      protocol: "KERI",
      major: 2,
      minor: 1,
      kind: "JSON",
      size: 1,
      legacy: false,
    });
  });
});

describe("Encode indexer", () => {
  test("Encode indexed signature", () => {
    const raw = Uint8Array.from(
      Buffer.from(
        "692f83469fa32ab52747b404b6e6815728329b664e7f5f8d3f009c042c19c245988dcfffd8b54a2c60d1d53a21166dd316dedeb6b05b865917da0022a2fb62c7",
        "hex",
      ),
    );

    const result = encoding.encodeIndexedSignature("ed25519", raw, 28);
    assert.equal(result, "AcBpL4NGn6MqtSdHtAS25oFXKDKbZk5_X40_AJwELBnCRZiNz__YtUosYNHVOiEWbdMW3t62sFuGWRfaACKi-2LH");
  });
});

describe("Counter v1", () => {
  test("Encode attachment group", () => {
    const result = encoding.encodeAttachmentsV1(39);
    assert.equal(result, `${CountCode_10.AttachmentGroup}An`);
  });

  test("Encode big attachment group", () => {
    const result = encoding.encodeAttachmentsV1(64 ** 2 + 1);
    assert.equal(result, `${CountCode_10.BigAttachmentGroup}AABAB`);
  });

  test("Encode genus", () => {
    const result = encoding.encodeGenus({ genus: "AAA", major: 3, minor: 1239 });
    assert.equal(result, `${CountCode_20.KERIACDCGenusVersion}DTX`);
  });

  test("Encode genus without minor", () => {
    const result = encoding.encodeGenus({ genus: "AAA", major: 3 });
    assert.equal(result, `${CountCode_20.KERIACDCGenusVersion}DAA`);
  });

  test("Decode genus", () => {
    const result = encoding.decodeGenus(`${CountCode_20.KERIACDCGenusVersion}DTX`);
    assert.deepEqual(result, { genus: "AAA", major: 3, minor: 1239 });
  });
});

describe("Counter v2", () => {
  test("Encode attachment group", () => {
    const result = encoding.encodeAttachmentsV2(39);
    assert.equal(result, `${CountCode_20.AttachmentGroup}An`);
  });

  test("Encode big attachment group", () => {
    const result = encoding.encodeAttachmentsV2(64 ** 2 + 1);
    assert.equal(result, `${CountCode_20.BigAttachmentGroup}AABAB`);
  });
});
