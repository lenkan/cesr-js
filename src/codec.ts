import { Matter } from "./matter.ts";
import { Indexer } from "./indexer.ts";

function createRaw(code: string): (raw: Uint8Array) => Matter {
  return (raw: Uint8Array): Matter => {
    return new Matter({ code, raw });
  };
}

function ed25519_sig(raw: Uint8Array): Matter;
function ed25519_sig(raw: Uint8Array, index: number, ondex?: number): Indexer;
function ed25519_sig(raw: Uint8Array, index?: number, ondex?: number): Matter | Indexer {
  if (index === undefined) {
    return Matter.from(Matter.Code.Ed25519_Sig, raw);
  }

  if (ondex === undefined) {
    if (index > 64) {
      return Indexer.from(Indexer.Code.Ed25519_Big_Crt_Sig, raw, index);
    }

    return Indexer.from(Indexer.Code.Ed25519_Sig, raw, index);
  }

  // TODO: Keripy also checks if index === ondex and then use Crt_Sig
  return Indexer.from(Indexer.Code.Ed25519_Big_Sig, raw, index, ondex);
}

function ed448_sig(raw: Uint8Array): Matter;
function ed448_sig(raw: Uint8Array, index: number, ondex?: number): Indexer;
function ed448_sig(raw: Uint8Array, index?: number, ondex?: number): Matter | Indexer {
  if (index === undefined) {
    return Matter.from(Matter.Code.Ed448_Sig, raw);
  }

  if (ondex === undefined) {
    if (index > 64) {
      return Indexer.from(Indexer.Code.Ed448_Big_Crt_Sig, raw, index);
    }

    return Indexer.from(Indexer.Code.Ed448_Crt_Sig, raw, index);
  }

  if (index > 64 || ondex > 64) {
    return Indexer.from(Indexer.Code.Ed448_Big_Sig, raw, index, ondex);
  }

  return Indexer.from(Indexer.Code.Ed448_Sig, raw, index, ondex);
}

export const cesr = {
  signature: {
    ed25519: ed25519_sig,
    ed448: ed448_sig,
  },
  digest: {
    blake3_256: createRaw(Matter.Code.Blake3_256),
    blake3_512: createRaw(Matter.Code.Blake3_512),
    blake2b_256: createRaw(Matter.Code.Blake2b_256),
    blake2s_256: createRaw(Matter.Code.Blake2s_256),
    sha3_256: createRaw(Matter.Code.SHA3_256),
    sha2_256: createRaw(Matter.Code.SHA2_256),
  },
  key: {
    ed25519: createRaw(Matter.Code.Ed25519),
    ed25519N: createRaw(Matter.Code.Ed25519N),
    ed448: createRaw(Matter.Code.Ed448),
    ed448N: createRaw(Matter.Code.Ed448N),
  },
  primitive: Matter.primitive,
};
