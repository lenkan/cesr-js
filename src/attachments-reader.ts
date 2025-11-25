import {
  Attachments,
  type TransLastIdxSigGroup,
  type TransIdxSigGroup,
  type PathedMaterialCouple,
} from "./attachments.ts";
import { CountCode_10, CountCode_20 } from "./codes.ts";
import { Counter } from "./counter.ts";
import { Indexer } from "./indexer.ts";
import { Matter } from "./matter.ts";

export interface AttachmentsReaderOptions {
  version?: number;
}

export class AttachmentsReader {
  #version: number;
  #buffer: Uint8Array<ArrayBufferLike>;
  #numberOfBytesRead = 0;

  constructor(input: Uint8Array, options: AttachmentsReaderOptions = {}) {
    this.#version = options.version ?? 1;
    this.#buffer = input;
  }

  get bytesRead(): number {
    return this.#numberOfBytesRead;
  }

  #peekBytes(count: number): Uint8Array {
    if (this.#buffer.length < count) {
      throw new Error("Not enough data to peek");
    }
    return this.#buffer.slice(0, count);
  }

  #readBytes(count: number): Uint8Array {
    const bytes = this.#peekBytes(count);
    this.#buffer = this.#buffer.slice(count);
    this.#numberOfBytesRead += count;
    return bytes;
  }

  #readMatter(): Matter {
    const result = Matter.peek(this.#buffer, Matter.Table.lookup(this.#buffer));
    if (!result.frame) {
      throw new Error("Failed to read matter, not enough data");
    }

    this.#readBytes(result.n);
    return Matter.from(result.frame);
  }

  #readIndexer(): Indexer {
    const result = Indexer.peek(this.#buffer);

    if (!result.frame) {
      throw new Error("Failed to read indexer, not enough data");
    }

    this.#readBytes(result.n);
    return result.frame;
  }

  #readCounter(): Counter {
    const result = Counter.peek(this.#buffer);

    if (!result.frame) {
      throw new Error("Failed to read counter, not enough data");
    }

    this.#readBytes(result.n);
    return result.frame;
  }

  /**
   * Read count couples (pairs) of matter primitives
   */
  *#readCouples(counter: Counter): IterableIterator<[Matter, Matter]> {
    for (let i = 0; i < counter.count; i++) {
      try {
        const couple0 = this.#readMatter();
        const couple1 = this.#readMatter();
        yield [couple0, couple1];
      } catch (error) {
        throw new Error(`Failed to read counter ${counter.code} at index ${i} of ${counter.count}: ${error}`);
      }
    }
  }

  /**
   * Read count triples of matter primitives
   */
  *#readTriples(count: number): IterableIterator<[Matter, Matter, Matter]> {
    for (let i = 0; i < count; i++) {
      const triple0 = this.#readMatter();
      const triple1 = this.#readMatter();
      const triple2 = this.#readMatter();
      yield [triple0, triple1, triple2];
    }
  }

  /**
   * Read count indexed signatures
   * Behavior differs based on version (v1 counts signatures, v2 counts quadlets)
   */
  *#readIndexedSignatures(count: number): IterableIterator<Indexer> {
    if (this.#version === 1) {
      for (let n = 0; n < count; n++) {
        yield this.#readIndexer();
      }
      return;
    }

    let counted = 0;
    while (counted < count) {
      const frame = this.#readIndexer();
      yield frame;
      counted += frame.text().length / 4;
    }
  }

  *#readTransLastIdxSigGroups(counter: Counter): IterableIterator<TransLastIdxSigGroup> {
    for (let i = 0; i < counter.count; i++) {
      const pre = this.#readMatter();
      const group = this.#readCounter();

      if (group.type !== CountCode_10.ControllerIdxSigs) {
        throw new Error(`Expected ControllerIdxSigs count code, got ${group.code}`);
      }

      const sigs = Array.from(this.#readIndexedSignatures(group.count));

      yield {
        prefix: pre.text(),
        ControllerIdxSigs: sigs.map((sig) => sig.text()),
      };
    }
  }

  *#readTransIdxSigGroups(counter: Counter): IterableIterator<TransIdxSigGroup> {
    for (let i = 0; i < counter.count; i++) {
      const pre = this.#readMatter();
      const snu = this.#readMatter();
      const dig = this.#readMatter();
      const group = this.#readCounter();

      if (group.type !== CountCode_10.ControllerIdxSigs) {
        throw new Error(`Expected ControllerIdxSigs count code, got ${group.code}`);
      }

      const sigs = Array.from(this.#readIndexedSignatures(group.count));

      yield {
        prefix: pre.text(),
        snu: snu.decode.hex(),
        digest: dig.text(),
        ControllerIdxSigs: sigs.map((sig) => sig.text()),
      };
    }
  }

  #readPathedAttachments(size: number): PathedMaterialCouple {
    const chunk = this.#readBytes(size * 4);
    const reader = new AttachmentsReader(chunk, { version: this.#version });
    const path = reader.#readMatter().decode.string();
    const pathAttachments = reader.readAttachments();

    if (!pathAttachments) {
      throw new Error(`Not enougth data to read pathed attachments for path ${path}`);
    }

    return {
      path,
      attachments: pathAttachments ?? new Attachments({}),
    };
  }

  readAttachments(): Attachments | null {
    if (this.#buffer.length === 0) {
      return null;
    }

    const result = Counter.peek(this.#buffer);

    if (!result.frame) {
      return null;
    }

    let end = 0;
    let grouped = false;

    if (this.#version === 1 && result.frame.type === CountCode_10.AttachmentGroup) {
      const requiredLength = result.frame.count * 4 + result.frame.n * 4;
      if (this.#buffer.length < requiredLength) {
        return null;
      }

      this.#readBytes(result.n);
      end = this.#buffer.length - result.frame.count * 4;
      grouped = true;
    } else if (this.#version === 2 && result.frame.type === CountCode_20.AttachmentGroup) {
      const requiredLength = result.frame.count * 4 + result.frame.n * 4;
      if (this.#buffer.length < requiredLength) {
        return null;
      }

      this.#readBytes(result.n);
      end = this.#buffer.length - result.frame.count * 4;
      grouped = true;
    }

    const attachments = new Attachments({ grouped });

    while (this.#buffer.length > end) {
      const counter = this.#readCounter();

      switch (this.#version) {
        case 1:
          switch (counter.type) {
            case CountCode_10.ControllerIdxSigs: {
              for (const sig of this.#readIndexedSignatures(counter.count)) {
                attachments.ControllerIdxSigs.push(sig.text());
              }
              break;
            }
            case CountCode_10.WitnessIdxSigs: {
              for (const sig of this.#readIndexedSignatures(counter.count)) {
                attachments.WitnessIdxSigs.push(sig.text());
              }
              break;
            }
            case CountCode_10.FirstSeenReplayCouples: {
              for (const [fnu, dt] of this.#readCouples(counter)) {
                attachments.FirstSeenReplayCouples.push({
                  fnu: fnu.decode.hex(),
                  dt: dt.decode.date(),
                });
              }
              break;
            }
            case CountCode_10.SealSourceCouples:
              for (const [snu, dig] of this.#readCouples(counter)) {
                attachments.SealSourceCouples.push({
                  snu: snu.decode.hex(),
                  digest: dig.text(),
                });
              }
              break;
            case CountCode_10.SealSourceTriples:
              for (const [pre, snu, dig] of this.#readTriples(counter.count)) {
                attachments.SealSourceTriples.push({
                  prefix: pre.text(),
                  snu: snu.decode.hex(),
                  digest: dig.text(),
                });
              }
              break;
            case CountCode_10.NonTransReceiptCouples:
              for (const [pre, sig] of this.#readCouples(counter)) {
                attachments.NonTransReceiptCouples.push({
                  prefix: pre.text(),
                  sig: sig.text(),
                });
              }
              break;
            case CountCode_10.PathedMaterialCouples: {
              const pathedAttachments = this.#readPathedAttachments(counter.count);
              attachments.PathedMaterialCouples.push(pathedAttachments);
              break;
            }
            case CountCode_10.TransIdxSigGroups: {
              for (const group of this.#readTransIdxSigGroups(counter)) {
                attachments.TransIdxSigGroups.push(group);
              }
              break;
            }
            case CountCode_10.TransLastIdxSigGroups: {
              for (const group of this.#readTransLastIdxSigGroups(counter)) {
                attachments.TransLastIdxSigGroups.push(group);
              }
              break;
            }
            default:
              throw new Error(`Unsupported group code ${counter.code}`);
          }
          break;
        case 2:
          switch (counter.type) {
            case CountCode_20.ControllerIdxSigs: {
              for (const sig of this.#readIndexedSignatures(counter.count)) {
                attachments.ControllerIdxSigs.push(sig.text());
              }
              break;
            }

            case CountCode_20.WitnessIdxSigs: {
              for (const sig of this.#readIndexedSignatures(counter.count)) {
                attachments.WitnessIdxSigs.push(sig.text());
              }
              break;
            }
            default:
              this.#readBytes(counter.count * 4);
              break;
          }
          break;
        default:
          throw new Error(`Unsupported parser version ${this.#version}`);
      }
    }

    return attachments;
  }
}
