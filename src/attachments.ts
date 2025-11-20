import {
  encodeCounter,
  encodeDate,
  encodeHexNumber,
  encodeString,
  decodeHexNumber,
  type Genus,
  decodeCounter,
  decodeDate,
} from "./encoding.ts";
import { CountCode_10, CountCode_20 } from "./codes.ts";
import { encodeUtf8 } from "./encoding-utf8.ts";
import { AttachmentsReader } from "./attachments-reader.ts";

export interface NonTransReceiptCouple {
  prefix: string;
  sig: string;
}

export interface FirstSeenReplayCouple {
  fnu: string;
  dt: Date;
}

export interface TransIdxSigGroup {
  prefix: string;
  snu: string;
  digest: string;
  ControllerIdxSigs: string[];
}

export interface TransLastIdxSigGroup {
  prefix: string;
  ControllerIdxSigs: string[];
}

export interface SealSourceTriple {
  prefix: string;
  snu: string;
  digest: string;
}

export interface SealSourceCouple {
  snu: string;
  digest: string;
}

export interface PathedMaterialCouple {
  path: string;
  attachments: Attachments;
}

export interface PathedMaterialCoupleInit {
  path: string;
  attachments: Attachments | AttachmentsInit;
}

export interface AttachmentsInit {
  genus?: Genus;
  grouped?: boolean;
  ControllerIdxSigs?: string[];
  WitnessIdxSigs?: string[];
  TransIdxSigGroups?: TransIdxSigGroup[];
  TransLastIdxSigGroups?: TransLastIdxSigGroup[];
  SealSourceTriples?: SealSourceTriple[];
  SealSourceCouples?: SealSourceCouple[];
  NonTransReceiptCouples?: NonTransReceiptCouple[];
  FirstSeenReplayCouples?: FirstSeenReplayCouple[];
  PathedMaterialCouples?: (PathedMaterialCouple | PathedMaterialCoupleInit)[];
}

export class Attachments implements AttachmentsInit {
  readonly ControllerIdxSigs: string[] = [];
  readonly WitnessIdxSigs: string[] = [];
  readonly FirstSeenReplayCouples: FirstSeenReplayCouple[] = [];
  readonly NonTransReceiptCouples: NonTransReceiptCouple[] = [];
  readonly TransIdxSigGroups: TransIdxSigGroup[] = [];
  readonly TransLastIdxSigGroups: TransLastIdxSigGroup[] = [];
  readonly PathedMaterialCouples: PathedMaterialCouple[] = [];
  readonly SealSourceTriples: SealSourceTriple[] = [];
  readonly SealSourceCouples: SealSourceCouple[] = [];

  grouped = true;

  constructor(init?: AttachmentsInit) {
    this.grouped = init?.grouped ?? this.grouped;
    this.ControllerIdxSigs.push(...(init?.ControllerIdxSigs ?? []));
    this.NonTransReceiptCouples.push(...(init?.NonTransReceiptCouples ?? []));
    this.WitnessIdxSigs.push(...(init?.WitnessIdxSigs ?? []));
    this.FirstSeenReplayCouples.push(...(init?.FirstSeenReplayCouples ?? []));
    this.TransIdxSigGroups.push(...(init?.TransIdxSigGroups ?? []));
    this.TransLastIdxSigGroups.push(...(init?.TransLastIdxSigGroups ?? []));
    this.SealSourceTriples.push(...(init?.SealSourceTriples ?? []));
    this.SealSourceCouples.push(...(init?.SealSourceCouples ?? []));
    this.PathedMaterialCouples.push(
      ...(init?.PathedMaterialCouples ?? []).map((p) => ({
        path: p.path,
        attachments: new Attachments(p.attachments),
      })),
    );
  }

  static parse(input: Uint8Array): Attachments | null {
    const reader = new AttachmentsReader(input);
    const attachments = reader.readAttachments();

    if (!attachments) {
      return null;
    }

    return attachments;
  }

  /**
   * Build an Attachments object from a sequence of CESR frames.
   *
   * This method takes the flat list of frames from the parser and reconstructs
   * the nested attachment structure. It handles both v1 and v2 CESR formats.
   *
   * @param frames - Array of parsed CESR frames
   * @param version - CESR version (1 or 2)
   * @returns An Attachments object, or null if frames don't represent valid attachments
   */
  static fromFrames(frames: string[], version: number): Attachments | null {
    const CountCode = version === 1 ? CountCode_10 : CountCode_20;
    if (frames.length === 0) {
      return null;
    }

    // First frame should be the attachment group counter
    const groupFrame = decodeCounter(frames[0]);
    if (groupFrame.code !== CountCode.AttachmentGroup) {
      return null;
    }

    const init: AttachmentsInit = {
      grouped: true,
    };

    let i = 1; // Skip the attachment group counter

    while (i < frames.length) {
      const frame = decodeCounter(frames[i]);

      // Process each subgroup
      const subgroupCode = frame.code;
      const subgroupCount = frame.count;
      i++; // Move past the counter

      switch (subgroupCode) {
        case CountCode.ControllerIdxSigs: {
          const sigs: string[] = [];
          const expectedCount = version === 1 ? subgroupCount : undefined;

          while (i < frames.length && !frames[i].startsWith("-")) {
            sigs.push(frames[i]);
            i++;

            if (version === 1 && sigs.length === expectedCount) {
              break;
            }
          }

          init.ControllerIdxSigs = sigs;
          break;
        }

        case CountCode.WitnessIdxSigs: {
          const sigs: string[] = [];
          const expectedCount = version === 1 ? subgroupCount : undefined;

          while (i < frames.length && !frames[i].startsWith("-")) {
            sigs.push(frames[i]);
            i++;

            if (version === 1 && sigs.length === expectedCount) {
              break;
            }
          }

          init.WitnessIdxSigs = sigs;
          break;
        }

        case CountCode.NonTransReceiptCouples: {
          const couples: { prefix: string; sig: string }[] = [];
          const expectedPairs = version === 1 ? subgroupCount : undefined;

          while (i < frames.length && !frames[i].startsWith("-")) {
            const prefix = frames[i];
            const sig = frames[i + 1];

            if (!sig) {
              throw new Error("Incomplete NonTransReceiptCouples pair");
            }

            couples.push({ prefix, sig });
            i += 2;

            if (version === 1 && couples.length === expectedPairs) {
              break;
            }
          }

          init.NonTransReceiptCouples = couples;
          break;
        }

        case CountCode.FirstSeenReplayCouples: {
          const couples: { fnu: string; dt: Date }[] = [];
          const expectedPairs = version === 1 ? subgroupCount : undefined;

          while (i < frames.length && !frames[i].startsWith("-")) {
            const fnu = frames[i];
            const dtText = frames[i + 1];

            if (!dtText) {
              throw new Error("Incomplete FirstSeenReplayCouples pair");
            }

            couples.push({ fnu: decodeHexNumber(fnu), dt: decodeDate(dtText) });
            i += 2;

            if (version === 1 && couples.length === expectedPairs) {
              break;
            }
          }

          init.FirstSeenReplayCouples = couples;
          break;
        }

        case CountCode.SealSourceCouples: {
          const couples: { snu: string; digest: string }[] = [];
          const expectedPairs = version === 1 ? subgroupCount : undefined;

          while (i < frames.length && !frames[i].startsWith("-")) {
            const snu = decodeHexNumber(frames[i]);
            const digest = frames[i + 1];

            if (!digest) {
              throw new Error("Incomplete SealSourceCouples pair");
            }

            couples.push({ snu, digest });
            i += 2;

            if (version === 1 && couples.length === expectedPairs) {
              break;
            }
          }

          init.SealSourceCouples = couples;
          break;
        }

        case CountCode.SealSourceTriples: {
          const triples: { prefix: string; snu: string; digest: string }[] = [];
          const expectedTriples = version === 1 ? subgroupCount : undefined;

          while (i < frames.length && !frames[i].startsWith("-")) {
            const prefix = frames[i];
            const snu = decodeHexNumber(frames[i + 1] ?? "");
            const digest = frames[i + 2];

            if (!snu || !digest) {
              throw new Error("Incomplete SealSourceTriples triple");
            }

            triples.push({ prefix, snu, digest });
            i += 3;

            if (version === 1 && triples.length === expectedTriples) {
              break;
            }
          }

          init.SealSourceTriples = triples;
          break;
        }

        case CountCode.TransIdxSigGroups: {
          const groups: {
            prefix: string;
            snu: string;
            digest: string;
            ControllerIdxSigs: string[];
          }[] = [];

          const expectedGroups = version === 1 ? subgroupCount : undefined;

          while (i < frames.length && !frames[i].startsWith("-")) {
            const prefix = frames[i];
            const snu = decodeHexNumber(frames[i + 1] ?? "");
            const digest = frames[i + 2];

            if (!snu || !digest) {
              throw new Error("Incomplete TransIdxSigGroups triple");
            }

            i += 3;

            // Next should be a ControllerIdxSigs counter
            if (i >= frames.length || !frames[i].startsWith("-")) {
              throw new Error("Expected ControllerIdxSigs counter in TransIdxSigGroups");
            }

            const sigGroup = decodeCounter(frames[i]);
            const sigsCounterCode = sigGroup.code;
            const sigsCount = sigGroup.count;
            i++; // Skip the counter

            if (sigsCounterCode !== CountCode.ControllerIdxSigs) {
              throw new Error(`Expected ControllerIdxSigs in TransIdxSigGroups, got ${sigsCounterCode}`);
            }

            const sigs: string[] = [];
            const expectedSigs = version === 1 ? sigsCount : undefined;

            while (i < frames.length && !frames[i].startsWith("-")) {
              sigs.push(frames[i]);
              i++;

              if (version === 1 && sigs.length === expectedSigs) {
                break;
              }
            }

            groups.push({ prefix, snu, digest, ControllerIdxSigs: sigs });

            if (version === 1 && groups.length === expectedGroups) {
              break;
            }
          }

          init.TransIdxSigGroups = groups;
          break;
        }

        case CountCode.TransLastIdxSigGroups: {
          const groups: {
            prefix: string;
            ControllerIdxSigs: string[];
          }[] = [];

          const expectedGroups = version === 1 ? subgroupCount : undefined;

          while (i < frames.length && !frames[i].startsWith("-")) {
            const prefix = frames[i];
            i++;

            // Next should be a ControllerIdxSigs counter
            if (i >= frames.length || !frames[i].startsWith("-")) {
              throw new Error("Expected ControllerIdxSigs counter in TransLastIdxSigGroups");
            }

            const sigGroup = decodeCounter(frames[i]);
            const sigsCounterCode = sigGroup.code;
            const sigsCount = sigGroup.count;
            i++; // Skip the counter

            if (sigsCounterCode !== CountCode.ControllerIdxSigs) {
              throw new Error(`Expected ControllerIdxSigs in TransLastIdxSigGroups, got ${sigsCounterCode}`);
            }

            const sigs: string[] = [];
            const expectedSigs = version === 1 ? sigsCount : undefined;

            while (i < frames.length && !frames[i].startsWith("-")) {
              sigs.push(frames[i]);
              i++;

              if (version === 1 && sigs.length === expectedSigs) {
                break;
              }
            }

            groups.push({ prefix, ControllerIdxSigs: sigs });

            if (version === 1 && groups.length === expectedGroups) {
              break;
            }
          }

          init.TransLastIdxSigGroups = groups;
          break;
        }

        default:
          throw new Error(`Unknown attachment subgroup code: ${subgroupCode}`);
      }
    }

    return new Attachments(init);
  }

  frames(): string[] {
    const frames: string[] = [];

    if (this.ControllerIdxSigs.length > 0) {
      frames.push(
        encodeCounter({
          code: CountCode_10.ControllerIdxSigs,
          count: this.ControllerIdxSigs.length,
        }),
        ...this.ControllerIdxSigs,
      );
    }

    if (this.TransIdxSigGroups.length > 0) {
      frames.push(
        encodeCounter({
          code: CountCode_10.TransIdxSigGroups,
          count: this.TransIdxSigGroups.length,
        }),
      );

      for (const group of this.TransIdxSigGroups) {
        frames.push(
          group.prefix,
          encodeHexNumber(group.snu),
          group.digest,
          encodeCounter({
            code: CountCode_10.ControllerIdxSigs,
            count: group.ControllerIdxSigs.length,
          }),
          ...group.ControllerIdxSigs,
        );
      }
    }

    if (this.TransLastIdxSigGroups.length > 0) {
      frames.push(
        encodeCounter({
          code: CountCode_10.TransLastIdxSigGroups,
          count: this.TransLastIdxSigGroups.length,
        }),
      );

      for (const group of this.TransLastIdxSigGroups) {
        frames.push(
          group.prefix,
          encodeCounter({
            code: CountCode_10.ControllerIdxSigs,
            count: group.ControllerIdxSigs.length,
          }),
          ...group.ControllerIdxSigs,
        );
      }
    }

    if (this.SealSourceTriples.length > 0) {
      frames.push(
        encodeCounter({
          code: CountCode_10.SealSourceTriples,
          count: this.SealSourceTriples.length,
        }),
      );

      for (const triple of this.SealSourceTriples) {
        frames.push(triple.prefix, encodeHexNumber(triple.snu), triple.digest);
      }
    }

    if (this.SealSourceCouples.length > 0) {
      frames.push(
        encodeCounter({
          code: CountCode_10.SealSourceCouples,
          count: this.SealSourceCouples.length,
        }),
      );

      for (const couple of this.SealSourceCouples) {
        frames.push(encodeHexNumber(couple.snu), couple.digest);
      }
    }

    if (this.NonTransReceiptCouples && this.NonTransReceiptCouples.length > 0) {
      frames.push(
        encodeCounter({
          code: CountCode_10.NonTransReceiptCouples,
          count: this.NonTransReceiptCouples.length,
        }),
        ...this.NonTransReceiptCouples.flatMap((receipt) => {
          return [receipt.prefix, receipt.sig];
        }),
      );
    }

    if (this.WitnessIdxSigs && this.WitnessIdxSigs.length > 0) {
      frames.push(
        encodeCounter({
          code: CountCode_10.WitnessIdxSigs,
          count: this.WitnessIdxSigs.length,
        }),
        ...this.WitnessIdxSigs,
      );
    }

    for (const couple of this.PathedMaterialCouples) {
      const nested: string[] = [];
      nested.push(encodeString(couple.path), ...couple.attachments.frames());
      const size = nested.reduce((acc, frame) => acc + frame.length, 0);
      if (size % 4 !== 0) {
        throw new Error("PathedMaterialCouple encoding resulted in non-aligned length");
      }

      // SIC! For PathedMaterialCouples, keripy does not encode
      // multiple "couples" under the same group. Instead each group
      // contains exactly one couple, and the count is size / 4.
      // Ref https://github.com/WebOfTrust/keripy/blob/fcec5085ef67a0e0bf6bcbca567a9ac9395bfb5f/src/keri/peer/exchanging.py#L461-L480
      frames.push(
        encodeCounter({
          code: CountCode_10.PathedMaterialCouples,
          count: size / 4,
        }),
        ...nested,
      );
    }

    if (this.FirstSeenReplayCouples.length > 0) {
      frames.push(
        encodeCounter({
          code: CountCode_10.FirstSeenReplayCouples,
          count: this.FirstSeenReplayCouples.length,
        }),
      );

      for (const couple of this.FirstSeenReplayCouples) {
        frames.push(encodeHexNumber(couple.fnu));
        frames.push(encodeDate(couple.dt));
      }
    }

    if (!this.grouped) {
      return frames;
    }

    const size = frames.reduce((acc, frame) => acc + frame.length, 0);
    if (size % 4 !== 0) {
      throw new Error("Attachments encoding resulted in non-aligned length");
    }

    const count = size / 4;
    return [
      encodeCounter({
        code: CountCode_10.AttachmentGroup,
        count,
      }),
      ...frames,
    ];
  }

  encode(): Uint8Array {
    return encodeUtf8(this.toString());
  }

  toString(): string {
    return this.frames().join("");
  }
}
