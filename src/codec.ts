import { Matter } from "./matter.ts";
import { Indexer } from "./indexer.ts";

function createRaw(code: string): (raw: Uint8Array) => Matter {
  return (raw: Uint8Array): Matter => {
    return new Matter({ code, raw });
  };
}

export const cesr = {
  crypto: {
    ed25519_sig: createRaw(Matter.Code.Ed25519_Sig),
    ed448_sig: createRaw(Matter.Code.Ed448_Sig),
    blake3_256: createRaw(Matter.Code.Blake3_256),
    blake3_512: createRaw(Matter.Code.Blake3_512),
    blake2b_256: createRaw(Matter.Code.Blake2b_256),
    blake2s_256: createRaw(Matter.Code.Blake2s_256),
    sha3_256: createRaw(Matter.Code.SHA3_256),
    sha2_256: createRaw(Matter.Code.SHA2_256),
    ed25519: createRaw(Matter.Code.Ed25519),
    ed25519N: createRaw(Matter.Code.Ed25519N),
    ed448: createRaw(Matter.Code.Ed448),
    ed448N: createRaw(Matter.Code.Ed448N),
  },
  index: Indexer.convert,
  primitive: Matter.primitive,
};
