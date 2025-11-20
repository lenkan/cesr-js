import { encodeCounter, encodeDate, encodeHexNumber, encodeString, type Genus } from "./encoding.ts";
import { CountCode_10 } from "./codes.ts";
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
