import { decodeBase64Int } from "./base64.ts";
import { IndexerSize, type MatterCodeSize, MatterSize } from "./codes.ts";
import { parseVersion } from "./version.ts";

interface CountFrame {
  type: "counter";
  count: number;
  code: string;
  text: string;
}

interface IndexedFrame {
  type: "indexer";
  code: string;
  text: string;
}

interface MatterFrame {
  type: "matter";
  code: string;
  text: string;
}

interface JsonFrame {
  type: "json";
  text: string;
}

type Frame = CountFrame | IndexedFrame | MatterFrame | JsonFrame;

function concat(a: Uint8Array, b: Uint8Array) {
  if (a.length === 0) {
    return b;
  }

  if (b.length === 0) {
    return a;
  }

  const merged = new Uint8Array(a.length + b.length);
  merged.set(a);
  merged.set(b, a.length);
  return merged;
}

export class Decoder {
  #decoder = new TextDecoder();
  #buffer: Uint8Array | null;

  #readBytes(start: number, size: number): Uint8Array | null {
    if (typeof size !== "number") {
      throw new Error(`Size must be a number, got '${size}'`);
    }

    if (!this.#buffer || this.#buffer.length < size) {
      return null;
    }

    const chunk = this.#buffer.slice(0, size);
    this.#buffer = this.#buffer.slice(size);
    return chunk;
  }

  #readCharacters(count: number): string | null {
    const chunk = this.#readBytes(0, count);
    return this.#decoder.decode(chunk);
  }

  #readIndexer(): IndexedFrame | null {
    let code = "";

    while (code.length < 4) {
      const next = this.#readBytes(0, 1);
      if (next === null) {
        return null;
      }

      code += this.#decoder.decode(next);
      const size = IndexerSize[code];

      if (size && size.fs) {
        const qb64 = this.#readCharacters(size.fs - size.hs);

        if (qb64 === null) {
          return null;
        }

        return { type: "indexer", code, text: qb64 };
      }
    }

    return null;
  }

  #readSize(): [string, number] | null {
    if (!this.#buffer) {
      return null;
    }

    let i = 0;
    let code = "";
    let size: MatterCodeSize | null = null;

    while (!size && i <= 4) {
      code = this.#decoder.decode(this.#buffer?.slice(0, i));
      size = MatterSize[code] ?? null;
      ++i;
    }

    if (!size) {
      return null;
    }

    if (!this.#buffer || this.#buffer.length < size.hs + size.ss) {
      return null;
    }

    if (size.fs !== null) {
      return [code, size.fs];
    }

    const soft = this.#decoder.decode(this.#buffer.slice(size.hs, size.hs + size.ss));
    const sizeQuadlets = decodeBase64Int(soft);
    return [code, size.hs + size.ss + sizeQuadlets * 4];
  }

  #readPrimitive(): MatterFrame | null {
    if (!this.#buffer) {
      return null;
    }

    let i = 0;
    let code = "";
    let size: MatterCodeSize | null = null;

    while (!size && i <= 4) {
      code = this.#decoder.decode(this.#buffer?.slice(0, i));
      size = MatterSize[code] ?? null;
      ++i;
    }

    if (!size) {
      return null;
    }

    if (size.fs !== null) {
      if (this.#buffer.length < size.fs) {
        return null;
      }

      const text = this.#decoder.decode(this.#buffer.slice(0, size.fs));
      return { type: "matter", code, text };
    }

    if (size.fs === null) {
      if (this.#buffer.length < size.hs + size.ss) {
        return null;
      }

      const sizeQuadlets = decodeBase64Int(this.#decoder.decode(this.#buffer.slice(size.hs, size.hs + size.ss)));
      const fullSize = size.hs + size.ss + sizeQuadlets * 4;
      if (this.#buffer.length < fullSize) {
        return null;
      }

      const text = this.#decoder.decode(this.#buffer.slice(0, size.hs + size.ss + sizeQuadlets * 4));
      return { type: "matter", code, text };
    }

    throw new Error(`Invalid frame size for code '${code}'`);
  }

  read(buffer: Uint8Array): Frame | null {
    this.#buffer = concat(this.#buffer ?? new Uint8Array(0), buffer);
    if (this.#buffer.length === 0) {
      return null;
    }

    const start = this.#buffer[0];
    if (start === null) {
      return null;
    }

    const code = this.#decoder.decode(this.#buffer.slice(0, 1));

    if (code === "{") {
      if (this.#buffer.length < 23) {
        return null;
      }

      const version = parseVersion(this.#decoder.decode(this.#buffer.slice(0, 23)));
      if (this.#buffer.length < version.size) {
        return null;
      }

      const payload = this.#decoder.decode(this.#buffer.slice(0, version.size));

      return {
        type: "json",
        text: payload,
      };
    }

    if (code === "-") {
      // for await (const frame of this.readCounter()) {
      //   yield frame;
      // }
      throw new Error(`Unexpected start of stream '${code}'`);
    }

    return this.#readPrimitive();
  }
}
