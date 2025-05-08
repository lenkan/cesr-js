import { decodeBase64Url } from "./base64.ts";
import { MatterCode, MatterTable } from "./codes.ts";
import { Decoder } from "./decoder.ts";
import { encode } from "./encoder.ts";

function padNumber(num: number, length: number) {
  return num.toString().padStart(length, "0");
}

// function getHardSize(input: Uint8Array): number {
//   const start = input[0];

//   if (start >= 65 && start <= 90) {
//     // 'A' - 'Z'
//     return 1;
//   }

//   if (start >= 97 && start <= 122) {
//     // 'a' - 'z'
//     return 1;
//   }

//   switch (start) {
//     case 48: // '0'
//       return 2;
//     case 49: // '1'
//     case 50: // '2'
//     case 51: // '3'
//       return 4;
//     case 52: // '4'
//     case 53: // '5'
//     case 54: // '6'
//       return 2;
//     case 55: // '7'
//     case 56: // '8'
//     case 57: // '9'
//       return 4;
//   }

//   throw new Error(`Invalid character in input (${start})`);
// }

export interface MatterInit {
  code: string;
  raw: Uint8Array;
}

export class Matter {
  static readonly decoder = new Decoder(MatterTable);

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
