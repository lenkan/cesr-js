import { decodeBase64Url } from "./base64.ts";
import { MatterCode, MatterTable } from "./codes.ts";
import { encode, decode } from "./encoding.ts";

function padNumber(num: number, length: number) {
  return num.toString().padStart(length, "0");
}

export interface MatterInit {
  code: string;
  raw: Uint8Array;
}

export type MatterDigest = "blake3_256" | "blake3_512";
export type MatterSignature = "ed25519" | "secp256k1";

export class Matter {
  readonly code: string;
  readonly raw: Uint8Array;
  readonly text: string;

  constructor(init: MatterInit) {
    this.code = init.code;
    this.raw = init.raw;
    this.text = encode(init, MatterTable);
  }

  static decode(input: Uint8Array | string): Matter {
    return new Matter(decode(input, MatterTable));
  }

  static string(txt: string): Matter {
    const raw = new TextEncoder().encode(txt);
    const length = raw.byteLength;
    const leadSize = length % 3;

    switch (leadSize) {
      case 0:
        return new Matter({ code: MatterCode.StrB64_L0, raw });
      case 1:
        return new Matter({ code: MatterCode.StrB64_L1, raw });
      case 2:
        return new Matter({ code: MatterCode.StrB64_L2, raw });
      default:
        throw new Error(`Could not determine lead size`);
    }
  }

  static signature(alg: MatterSignature, data: Uint8Array): Matter {
    switch (alg) {
      case "ed25519":
        return new Matter({ code: MatterCode.Ed25519_Sig, raw: data });
      case "secp256k1":
        return new Matter({ code: MatterCode.ECDSA_256k1_Sig, raw: data });
      default:
        throw new Error(`Unsupported signature algorithm: ${alg}`);
    }
  }

  static digest(alg: MatterDigest, data: Uint8Array): Matter {
    switch (alg) {
      case "blake3_256":
        return new Matter({ code: MatterCode.Blake3_256, raw: data });
      case "blake3_512":
        return new Matter({ code: MatterCode.Blake3_256, raw: data });
      default:
        throw new Error(`Unsupported digest algorithm: ${alg}`);
    }
  }

  static date(date: Date) {
    if (date.toString() === "Invalid Date") {
      throw new Error("Invalid date");
    }

    // TODO: Better design for date encoding
    const YYYY = date.getFullYear();
    const MM = padNumber(date.getUTCMonth() + 1, 2);
    const dd = padNumber(date.getUTCDate(), 2);
    const hh = padNumber(date.getUTCHours(), 2);
    const mm = padNumber(date.getUTCMinutes(), 2);
    const ss = padNumber(date.getUTCSeconds(), 2);
    const ms = padNumber(date.getUTCMilliseconds(), 3);

    const raw = decodeBase64Url(`${YYYY}-${MM}-${dd}T${hh}c${mm}c${ss}d${ms}000p00c00`);
    return new Matter({ code: MatterCode.DateTime, raw });
  }
}
