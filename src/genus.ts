import { decodeBase64Int, encodeBase64Int } from "./encoding-base64.ts";
import { encodeBinary, encodeText, type Frame, type FrameSize, decodeText, resolveQuadletCount } from "./frame.ts";

export interface GenusInit {
  protocol: string;
  major: number;
  minor?: number;
}

const Size: FrameSize = Object.freeze({
  hs: 5,
  ss: 3,
  fs: 8,
  ls: 0,
  xs: 0,
});

export class Genus implements Frame, GenusInit {
  readonly code: string;
  readonly protocol: string;
  readonly major: number;
  readonly minor: number;

  constructor(init: GenusInit) {
    if (typeof init.major !== "number" || init.major < 0 || init.major > 63) {
      throw new Error(`Invalid major version: ${init.major}`);
    }

    const minor = init.minor ?? 0;
    if (typeof minor !== "number" || minor < 0) {
      throw new Error(`Invalid minor version: ${minor}`);
    }

    this.code = `-_${init.protocol}`;
    this.protocol = init.protocol;
    this.major = init.major;
    this.minor = init.minor ?? 0;
  }

  get size(): FrameSize {
    return Size;
  }

  get soft(): number {
    return decodeBase64Int(`${encodeBase64Int(this.major, 1)}${encodeBase64Int(this.minor, 2)}`);
  }

  get quadlets(): number {
    return resolveQuadletCount(this);
  }

  text(): string {
    return encodeText(this);
  }

  binary(): Uint8Array {
    return encodeBinary(this);
  }

  static KERIACDC_10 = new Genus({
    protocol: "AAA",
    major: 1,
    minor: 0,
  });

  static KERIACDC_20 = new Genus({
    protocol: "AAA",
    major: 2,
    minor: 0,
  });

  static parse(input: string | Uint8Array): Genus {
    const frame = decodeText(input, Size);

    const genus = frame.code.slice(2);
    const soft = encodeBase64Int(frame.soft ?? 0, 3);
    const major = decodeBase64Int(soft.slice(0, 1));
    const minor = decodeBase64Int(soft.slice(1, 3));

    return new Genus({
      protocol: genus,
      major,
      minor,
    });
  }
}
