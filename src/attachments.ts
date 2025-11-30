import { encodeUtf8 } from "./encoding-utf8.ts";
import { AttachmentsReader } from "./attachments-reader.ts";
import { Matter } from "./matter.ts";
import { Counter } from "./counter.ts";
import type { Frame } from "./frame.ts";
import { Indexer } from "./indexer.ts";

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
  grouped: boolean;
  attachments: Attachments;
}

export interface PathedMaterialCoupleInit {
  path: string;
  /**
   * Determines whether to wrap this couple in an attachment group frame
   */
  grouped?: boolean;
  attachments: AttachmentsInit;
}

export interface AttachmentsInit {
  ControllerIdxSigs?: string[];
  WitnessIdxSigs?: string[];
  TransIdxSigGroups?: TransIdxSigGroup[];
  TransLastIdxSigGroups?: TransLastIdxSigGroup[];
  SealSourceTriples?: SealSourceTriple[];
  SealSourceCouples?: SealSourceCouple[];
  NonTransReceiptCouples?: NonTransReceiptCouple[];
  FirstSeenReplayCouples?: FirstSeenReplayCouple[];
  PathedMaterialCouples?: PathedMaterialCoupleInit[];
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

  constructor(init?: AttachmentsInit) {
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
        grouped: p.grouped ?? false,
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

  frames(): Frame[] {
    const frames: Frame[] = [];

    if (this.ControllerIdxSigs.length > 0) {
      frames.push(
        Counter.v1.ControllerIdxSigs(this.ControllerIdxSigs.length),
        ...this.ControllerIdxSigs.map((sig) => Indexer.parse(sig)),
      );
    }

    if (this.TransIdxSigGroups.length > 0) {
      frames.push(Counter.v1.TransIdxSigGroups(this.TransIdxSigGroups.length));

      for (const group of this.TransIdxSigGroups) {
        frames.push(
          Matter.parse(group.prefix),
          Matter.primitive.hex(group.snu),
          Matter.parse(group.digest),
          Counter.v1.ControllerIdxSigs(group.ControllerIdxSigs.length),
          ...group.ControllerIdxSigs.map((sig) => Indexer.parse(sig)),
        );
      }
    }

    if (this.TransLastIdxSigGroups.length > 0) {
      frames.push(Counter.v1.TransLastIdxSigGroups(this.TransLastIdxSigGroups.length));

      for (const group of this.TransLastIdxSigGroups) {
        frames.push(
          Matter.parse(group.prefix),
          Counter.v1.ControllerIdxSigs(group.ControllerIdxSigs.length),
          ...group.ControllerIdxSigs.map((sig) => Indexer.parse(sig)),
        );
      }
    }

    if (this.SealSourceTriples.length > 0) {
      frames.push(Counter.v1.SealSourceTriples(this.SealSourceTriples.length));

      for (const triple of this.SealSourceTriples) {
        const snu = Matter.primitive.hex(triple.snu);
        const prefix = Matter.parse(triple.prefix);
        const digest = Matter.parse(triple.digest);
        frames.push(prefix, snu, digest);
      }
    }

    if (this.SealSourceCouples.length > 0) {
      frames.push(Counter.v1.SealSourceCouples(this.SealSourceCouples.length));

      for (const couple of this.SealSourceCouples) {
        const snu = Matter.primitive.hex(couple.snu);
        frames.push(snu, Matter.parse(couple.digest));
      }
    }

    if (this.NonTransReceiptCouples && this.NonTransReceiptCouples.length > 0) {
      frames.push(
        Counter.v1.NonTransReceiptCouples(this.NonTransReceiptCouples.length),
        ...this.NonTransReceiptCouples.flatMap((receipt) => {
          return [Matter.parse(receipt.prefix), Matter.parse(receipt.sig)];
        }),
      );
    }

    if (this.WitnessIdxSigs && this.WitnessIdxSigs.length > 0) {
      frames.push(
        Counter.v1.WitnessIdxSigs(this.WitnessIdxSigs.length),
        ...this.WitnessIdxSigs.map((sig) => Indexer.parse(sig)),
      );
    }

    for (const couple of this.PathedMaterialCouples) {
      const nested: Frame[] = [Matter.primitive.string(couple.path)];

      if (couple.grouped === true) {
        nested.push(...couple.attachments.frames());
      } else {
        nested.push(...couple.attachments.frames().slice(1));
      }

      const size = nested.reduce((acc, frame) => acc + frame.quadlets, 0);

      // SIC! For PathedMaterialCouples, keripy does not encode
      // multiple "couples" under the same group. Instead each group
      // contains exactly one couple, and the count is number of quadlets per couple.
      // Ref https://github.com/WebOfTrust/keripy/blob/fcec5085ef67a0e0bf6bcbca567a9ac9395bfb5f/src/keri/peer/exchanging.py#L461-L480
      frames.push(Counter.v1.PathedMaterialCouples(size), ...nested);
    }

    if (this.FirstSeenReplayCouples.length > 0) {
      frames.push(Counter.v1.FirstSeenReplayCouples(this.FirstSeenReplayCouples.length));

      for (const couple of this.FirstSeenReplayCouples) {
        const fnu = Matter.primitive.hex(couple.fnu);
        const dt = Matter.primitive.date(couple.dt);
        frames.push(fnu);
        frames.push(dt);
      }
    }

    const size = frames.reduce((acc, frame) => acc + frame.quadlets, 0);
    return [Counter.v1.AttachmentGroup(size), ...frames];
  }

  binary(): Uint8Array {
    const frames = this.frames();
    return encodeUtf8(frames.reduce((acc, frame) => acc + frame.text(), ""));
  }

  text(): string {
    const frames = this.frames();
    return frames.reduce((acc, frame) => acc + frame.text(), "");
  }
}
