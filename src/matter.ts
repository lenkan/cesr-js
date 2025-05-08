import { decodeBase64Url } from "./base64.ts";
import { MatterCode, MatterSchemeTable, MatterTable } from "./codes.ts";
import { decode } from "./decoder.ts";
import { encode } from "./encoder.ts";

function padNumber(num: number, length: number) {
  return num.toString().padStart(length, "0");
}

export interface MatterInit {
  code: string;
  raw: Uint8Array;
}

export class Matter {
  static sizes = MatterTable;
  static hards = MatterSchemeTable;

  readonly code: string;
  readonly raw: Uint8Array;
  readonly text: string;

  constructor(init: MatterInit) {
    const size = MatterTable[init.code];
    if (!size) {
      throw new Error(`Invalid code: ${init.code}`);
    }

    this.code = init.code;
    this.raw = init.raw;
    this.text = encode(init, MatterTable[init.code]);
  }

  static decode(input: Uint8Array | string): Matter {
    return new Matter(decode(input, Matter));
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
