import test, { describe } from "node:test";
import { basename } from "node:path";
import assert from "node:assert";
import { Indexer } from "./indexer.ts";
import { inspect } from "node:util";
import { Matter } from "./matter.ts";

describe(basename(import.meta.url), () => {
  describe("ed25519", () => {
    test("should create ed25519 signature", () => {
      const raw = new Uint8Array(64);
      const index = 1;
      const frame = Indexer.crypto.ed25519_sig(raw, index);

      assert.strictEqual(frame.code, Indexer.Code.Ed25519_Sig);
      assert.strictEqual(frame.text().slice(0, 2), "AB");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, undefined);
      assert.deepStrictEqual(frame.raw, raw);
    });

    test("should create ed25519 signature with ondex", () => {
      const raw = new Uint8Array(64);
      const index = 1;
      const ondex = 3;
      const frame = Indexer.crypto.ed25519_sig(raw, index, ondex);

      assert.strictEqual(frame.code, Indexer.Code.Ed25519_Big_Sig);
      assert.strictEqual(frame.text().slice(0, 6), "2AABAD");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, ondex);
      assert.deepStrictEqual(frame.raw, raw);
    });

    test("should create big ed25519 signature", () => {
      const raw = new Uint8Array(64);
      const index = 65;
      const frame = Indexer.crypto.ed25519_sig(raw, index);

      assert.strictEqual(frame.code, Indexer.Code.Ed25519_Big_Crt_Sig);
      assert.strictEqual(frame.text().slice(0, 6), "2BBBAA");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, undefined);
      assert.deepStrictEqual(frame.raw, raw);
    });

    test("should create big ed25519 signature with ondex", () => {
      const raw = new Uint8Array(64);
      const index = 65;
      const ondex = 66;
      const frame = Indexer.crypto.ed25519_sig(raw, index, ondex);

      assert.strictEqual(frame.code, Indexer.Code.Ed25519_Big_Sig);
      assert.strictEqual(frame.text().slice(0, 6), "2ABBBC");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, ondex);
      assert.deepStrictEqual(frame.raw, raw);
    });
  });

  describe("ed448", () => {
    test("should create ed448 signature", () => {
      const raw = new Uint8Array(114);
      const index = 1;
      const frame = Indexer.crypto.ed448_sig(raw, index);

      assert.strictEqual(frame.code, Indexer.Code.Ed448_Crt_Sig);
      assert.strictEqual(frame.text().slice(0, 4), "0BBA");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, undefined);
      assert.deepStrictEqual(frame.raw, raw);
    });

    test("should create ed448 signature with ondex", () => {
      const raw = new Uint8Array(114);
      const index = 1;
      const ondex = 2;
      const frame = Indexer.crypto.ed448_sig(raw, index, ondex);

      assert.strictEqual(frame.code, Indexer.Code.Ed448_Sig);
      assert.strictEqual(frame.text().slice(0, 4), "0ABC");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, ondex);
      assert.deepStrictEqual(frame.raw, raw);
    });

    test("should create big ed448 signature", () => {
      const raw = new Uint8Array(114);
      const index = 65;
      const frame = Indexer.crypto.ed448_sig(raw, index);

      assert.strictEqual(frame.code, Indexer.Code.Ed448_Big_Crt_Sig);
      assert.strictEqual(frame.text().slice(0, 8), "3BABBAAA");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, undefined);
      assert.deepStrictEqual(frame.raw, raw);
    });

    test("should create big ed448 signature with ondex", () => {
      const raw = new Uint8Array(114);
      const index = 65;
      const ondex = 66;
      const frame = Indexer.crypto.ed448_sig(raw, index, ondex);

      assert.strictEqual(frame.code, Indexer.Code.Ed448_Big_Sig);
      assert.strictEqual(frame.text().slice(0, 8), "3AABBABC");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, ondex);
      assert.deepStrictEqual(frame.raw, raw);
    });
  });

  describe("ecdsa_256k1", () => {
    test("should create ecdsa_256k1 signature", () => {
      const raw = new Uint8Array(64);
      const index = 1;
      const frame = Indexer.crypto.ecdsa_256k1_sig(raw, index);

      assert.strictEqual(frame.code, Indexer.Code.ECDSA_256k1_Sig);
      assert.strictEqual(frame.text().slice(0, 2), "CB");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, undefined);
      assert.deepStrictEqual(frame.raw, raw);
    });

    test("should create big ecdsa_256k1 signature", () => {
      const raw = new Uint8Array(64);
      const index = 65;
      const frame = Indexer.crypto.ecdsa_256k1_sig(raw, index);

      assert.strictEqual(frame.code, Indexer.Code.ECDSA_256k1_Big_Sig);
      assert.strictEqual(frame.text().slice(0, 6), "2CBBAA");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, undefined);
      assert.deepStrictEqual(frame.raw, raw);
    });

    test("should create ecdsa_256k1 signature with ondex", () => {
      const raw = new Uint8Array(64);
      const index = 1;
      const ondex = 2;
      const frame = Indexer.crypto.ecdsa_256k1_sig(raw, index, ondex);

      assert.strictEqual(frame.code, Indexer.Code.ECDSA_256k1_Big_Sig);
      assert.strictEqual(frame.text().slice(0, 6), "2CABAC");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, ondex);
      assert.deepStrictEqual(frame.raw, raw);
    });

    test("should create big ecdsa_256k1 signature with ondex", () => {
      const raw = new Uint8Array(64);
      const index = 65;
      const ondex = 66;
      const frame = Indexer.crypto.ecdsa_256k1_sig(raw, index, ondex);

      assert.strictEqual(frame.code, Indexer.Code.ECDSA_256k1_Big_Sig);
      assert.strictEqual(frame.text().slice(0, 6), "2CBBBC");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, ondex);
      assert.deepStrictEqual(frame.raw, raw);
    });
  });

  describe("ecdsa_256r1", () => {
    test("should create ecdsa_256r1 signature", () => {
      const raw = new Uint8Array(64);
      const index = 1;
      const frame = Indexer.crypto.ecdsa_256r1_sig(raw, index);

      assert.strictEqual(frame.code, Indexer.Code.ECDSA_256r1_Sig);
      assert.strictEqual(frame.text().slice(0, 2), "EB");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, undefined);
      assert.deepStrictEqual(frame.raw, raw);
    });

    test("should create big ecdsa_256r1 signature", () => {
      const raw = new Uint8Array(64);
      const index = 65;
      const frame = Indexer.crypto.ecdsa_256r1_sig(raw, index);

      assert.strictEqual(frame.code, Indexer.Code.ECDSA_256r1_Big_Sig);
      assert.strictEqual(frame.text().slice(0, 6), "2EBBAA");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, undefined);
      assert.deepStrictEqual(frame.raw, raw);
    });

    test("should create ecdsa_256r1 signature with ondex", () => {
      const raw = new Uint8Array(64);
      const index = 1;
      const ondex = 2;
      const frame = Indexer.crypto.ecdsa_256r1_sig(raw, index, ondex);

      assert.strictEqual(frame.code, Indexer.Code.ECDSA_256r1_Big_Sig);
      assert.strictEqual(frame.text().slice(0, 6), "2EABAC");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, ondex);
      assert.deepStrictEqual(frame.raw, raw);
    });

    test("should create big ecdsa_256r1 signature with ondex", () => {
      const raw = new Uint8Array(64);
      const index = 65;
      const ondex = 66;
      const frame = Indexer.crypto.ecdsa_256r1_sig(raw, index, ondex);

      assert.strictEqual(frame.code, Indexer.Code.ECDSA_256r1_Big_Sig);
      assert.strictEqual(frame.text().slice(0, 6), "2EBBBC");
      assert.strictEqual(frame.index, index);
      assert.strictEqual(frame.ondex, ondex);
      assert.deepStrictEqual(frame.raw, raw);
    });
  });

  describe("convert", () => {
    test("should throw on converting Matter without raw", () => {
      assert.throws(() => {
        Indexer.convert({ code: Matter.Code.Ed25519_Sig }, 1);
      }, /Cannot create Indexer from Matter without raw data/);
    });

    test("should convert ed25519_sig to Indexer with index", () => {
      const sig = Matter.crypto.ed25519_sig(new Uint8Array(64));
      const indexer = Indexer.convert(sig, 32);

      assert.strictEqual(indexer.code, Indexer.Code.Ed25519_Sig);
      assert.strictEqual(indexer.index, 32);
      assert.strictEqual(indexer.ondex, undefined);
      assert.deepStrictEqual(indexer.raw, sig.raw);
    });

    test("should convert ed25519_sig to Indexer with index and ondex", () => {
      const sig = Matter.crypto.ed25519_sig(new Uint8Array(64));
      const indexer = Indexer.convert(sig, 32, 12);

      assert.strictEqual(indexer.code, Indexer.Code.Ed25519_Big_Sig);
      assert.strictEqual(indexer.index, 32);
      assert.strictEqual(indexer.ondex, 12);
      assert.deepStrictEqual(indexer.raw, sig.raw);
    });

    test("should convert ecdsa_256k1_sig to Indexer with index", () => {
      const sig = Matter.from(Matter.Code.ECDSA_256k1_Sig, new Uint8Array(64));
      const indexer = Indexer.convert(sig, 45);

      assert.strictEqual(indexer.code, Indexer.Code.ECDSA_256k1_Sig);
      assert.strictEqual(indexer.index, 45);
      assert.strictEqual(indexer.ondex, undefined);
      assert.deepStrictEqual(indexer.raw, sig.raw);
    });

    test("should convert ecdsa_256k1_sig to Indexer with index and ondex", () => {
      const sig = Matter.from(Matter.Code.ECDSA_256k1_Sig, new Uint8Array(64));
      const indexer = Indexer.convert(sig, 45, 23);

      assert.strictEqual(indexer.code, Indexer.Code.ECDSA_256k1_Big_Sig);
      assert.strictEqual(indexer.index, 45);
      assert.strictEqual(indexer.ondex, 23);
      assert.deepStrictEqual(indexer.raw, sig.raw);
    });

    test("should convert ecdsa_256r1_sig to Indexer with index", () => {
      const sig = Matter.from(Matter.Code.ECDSA_256r1_Sig, new Uint8Array(64));
      const indexer = Indexer.convert(sig, 50);

      assert.strictEqual(indexer.code, Indexer.Code.ECDSA_256r1_Sig);
      assert.strictEqual(indexer.index, 50);
      assert.strictEqual(indexer.ondex, undefined);
      assert.deepStrictEqual(indexer.raw, sig.raw);
    });

    test("should convert ecdsa_256r1_sig to Indexer with index and ondex", () => {
      const sig = Matter.from(Matter.Code.ECDSA_256r1_Sig, new Uint8Array(64));
      const indexer = Indexer.convert(sig, 50, 30);

      assert.strictEqual(indexer.code, Indexer.Code.ECDSA_256r1_Big_Sig);
      assert.strictEqual(indexer.index, 50);
      assert.strictEqual(indexer.ondex, 30);
      assert.deepStrictEqual(indexer.raw, sig.raw);
    });
  });

  describe("inspect", () => {
    test("should display code and raw", () => {
      const frame = Indexer.crypto.ed25519_sig(new Uint8Array(64), 32, 12);
      assert.deepStrictEqual(inspect(frame, { colors: false }).split("\n"), [
        `Indexer {`,
        `  code: '${frame.code}',`,
        `  index: 32,`,
        `  ondex: 12,`,
        "  raw: Uint8Array(64) [",
        `    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,`,
        `    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,`,
        `    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,`,
        `    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,`,
        `    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,`,
        `    0, 0, 0, 0`,
        `  ]`,
        `}`,
      ]);
    });
  });
});
