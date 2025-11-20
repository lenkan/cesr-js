import { Attachments, type TransLastIdxSigGroup, type TransIdxSigGroup } from "./attachments.ts";
import { CountCode_10, CountCode_20 } from "./codes.ts";
import {
  type Counter,
  decodeDate,
  decodeHexNumber,
  decodeString,
  type Indexer,
  type Matter,
  readCounter,
  readIndexer,
  readMatter,
} from "./encoding.ts";

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
    const result = readMatter(this.#buffer);

    if (!result.frame) {
      throw new Error("Failed to read matter, not enough data");
    }

    this.#readBytes(result.n);
    return result.frame;
  }

  #readIndexer(): Indexer {
    const result = readIndexer(this.#buffer);

    if (!result.frame) {
      throw new Error("Failed to read indexer, not enough data");
    }

    this.#readBytes(result.n);
    return result.frame;
  }

  #peekCounter(): Counter | null {
    const result = readCounter(this.#buffer);

    if (!result.frame) {
      return null;
    }

    return result.frame;
  }

  #readCounter(): Counter {
    const result = readCounter(this.#buffer);

    if (!result.frame) {
      throw new Error("Failed to read counter, not enough data");
    }

    this.#readBytes(result.n);
    return result.frame;
  }

  /**
   * Read count couples (pairs) of matter primitives
   */
  *#readCouples(count: number): IterableIterator<[string, string]> {
    for (let i = 0; i < count; i++) {
      const couple0 = this.#readMatter();
      const couple1 = this.#readMatter();
      yield [couple0.text, couple1.text];
    }
  }

  /**
   * Read count triples of matter primitives
   */
  *#readTriples(count: number): IterableIterator<[string, string, string]> {
    for (let i = 0; i < count; i++) {
      const triple0 = this.#readMatter();
      const triple1 = this.#readMatter();
      const triple2 = this.#readMatter();
      yield [triple0.text, triple1.text, triple2.text];
    }
  }

  /**
   * Read count indexed signatures
   * Behavior differs based on version (v1 counts signatures, v2 counts quadlets)
   */
  *#readIndexedSignatures(count: number): IterableIterator<string> {
    if (this.#version === 1) {
      for (let n = 0; n < count; n++) {
        yield this.#readIndexer().text;
      }
      return;
    }

    let counted = 0;
    while (counted < count) {
      const frame = this.#readIndexer();
      yield frame.text;
      counted += frame.text.length / 4;
    }
  }

  *#readTransLastIdxSigGroups(counter: Counter): IterableIterator<TransLastIdxSigGroup> {
    for (let i = 0; i < counter.count; i++) {
      const pre = this.#readMatter();
      const group = this.#readCounter();

      if (group.code !== CountCode_10.ControllerIdxSigs) {
        throw new Error(`Expected ControllerIdxSigs count code, got ${group.code}`);
      }

      const sigs = Array.from(this.#readIndexedSignatures(group.count));

      yield {
        prefix: pre.text,
        ControllerIdxSigs: sigs,
      };
    }
  }

  *#readTransIdxSigGroups(counter: Counter): IterableIterator<TransIdxSigGroup> {
    for (let i = 0; i < counter.count; i++) {
      const pre = this.#readMatter();
      const snu = this.#readMatter();
      const dig = this.#readMatter();
      const group = this.#readCounter();

      if (group.code !== CountCode_10.ControllerIdxSigs) {
        throw new Error(`Expected ControllerIdxSigs count code, got ${group.code}`);
      }

      const sigs = Array.from(this.#readIndexedSignatures(group.count));

      yield {
        prefix: pre.text,
        snu: decodeHexNumber(snu.text),
        digest: dig.text,
        ControllerIdxSigs: sigs,
      };
    }
  }

  readAttachments(): Attachments | null {
    if (this.#buffer.length === 0) {
      return null;
    }

    const counter = this.#peekCounter();

    if (counter === null) {
      return null;
    }

    let end = 0;

    if (this.#version === 1 && counter.code === CountCode_10.AttachmentGroup) {
      if (this.#buffer.length < counter.count * 4) {
        return null;
      }

      this.#readBytes(counter.text.length);
      end = this.#buffer.length - counter.count * 4;
    } else if (this.#version === 2 && counter.code === CountCode_20.AttachmentGroup) {
      if (this.#buffer.length < counter.count * 4) {
        return null;
      }

      this.#readBytes(counter.text.length);
      end = this.#buffer.length - counter.count * 4;
    }

    const attachments = new Attachments();

    while (this.#buffer.length > end) {
      const counter = this.#readCounter();

      switch (this.#version) {
        case 1:
          switch (counter.code) {
            case CountCode_10.ControllerIdxSigs:
              attachments.ControllerIdxSigs.push(...this.#readIndexedSignatures(counter.count));
              break;
            case CountCode_10.WitnessIdxSigs:
              attachments.WitnessIdxSigs.push(...this.#readIndexedSignatures(counter.count));
              break;
            case CountCode_10.FirstSeenReplayCouples: {
              for (const [fnu, dt] of this.#readCouples(counter.count)) {
                attachments.FirstSeenReplayCouples.push({
                  fnu: decodeHexNumber(fnu),
                  dt: decodeDate(dt),
                });
              }
              break;
            }
            case CountCode_10.SealSourceCouples:
              for (const [snu, dig] of this.#readCouples(counter.count)) {
                attachments.SealSourceCouples.push({
                  snu: decodeHexNumber(snu),
                  digest: dig,
                });
              }
              break;
            case CountCode_10.SealSourceTriples:
              for (const [pre, snu, dig] of this.#readTriples(counter.count)) {
                attachments.SealSourceTriples.push({
                  prefix: pre,
                  snu: decodeHexNumber(snu),
                  digest: dig,
                });
              }
              break;
            case CountCode_10.NonTransReceiptCouples:
              for (const [pre, sig] of this.#readCouples(counter.count)) {
                attachments.NonTransReceiptCouples.push({
                  prefix: pre,
                  sig,
                });
              }
              break;
            case CountCode_10.PathedMaterialCouples: {
              const start = this.#buffer.length;
              while (this.#buffer.length > start - counter.count * 4) {
                const path = decodeString(this.#readMatter().text);
                const pathAttachments = this.readAttachments();

                if (pathAttachments) {
                  attachments.PathedMaterialCouples.push({ path, attachments: pathAttachments });
                }
              }
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
          switch (counter.code) {
            case CountCode_20.ControllerIdxSigs:
              attachments.ControllerIdxSigs.push(...this.#readIndexedSignatures(counter.count));
              break;
            case CountCode_20.WitnessIdxSigs:
              attachments.WitnessIdxSigs.push(...this.#readIndexedSignatures(counter.count));
              break;
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
