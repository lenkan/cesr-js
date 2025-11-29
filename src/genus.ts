import { decodeBase64Int, encodeBase64Int } from "./encoding-base64.ts";
import { decodeUtf8 } from "./encoding-utf8.ts";
import { Frame, type FrameInit } from "./frame.ts";

export interface GenusInit {
  protocol: string;
  major: number;
  minor?: number;
}

function resolveGenusFrame(genus: GenusInit): FrameInit {
  if (typeof genus.major !== "number" || genus.major < 0 || genus.major > 63) {
    throw new Error(`Invalid major version: ${genus.major}`);
  }

  const minor = genus.minor ?? 0;
  if (typeof minor !== "number" || minor < 0) {
    throw new Error(`Invalid minor version: ${minor}`);
  }

  return {
    code: `-_${genus.protocol}`,
    soft: decodeBase64Int(`${encodeBase64Int(genus.major, 1)}${encodeBase64Int(minor, 2)}`),
    size: {
      hs: 5,
      ss: 3,
    },
  };
}

export class Genus extends Frame implements GenusInit {
  readonly protocol: string;
  readonly major: number;
  readonly minor: number;

  constructor(init: GenusInit) {
    super(resolveGenusFrame(init));
    this.protocol = init.protocol;
    this.major = init.major;
    this.minor = init.minor ?? 0;
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
    if (typeof input !== "string") {
      input = decodeUtf8(input.slice(0, 8));
    }

    if (input.length < 8) {
      throw new Error(`Input too short to parse Genus: "${input}"`);
    }

    const genus = input.slice(2, 5);
    const major = decodeBase64Int(input.slice(5, 6));
    const minor = decodeBase64Int(input.slice(6, 8));

    return new Genus({
      protocol: genus,
      major,
      minor,
    });
  }
}
