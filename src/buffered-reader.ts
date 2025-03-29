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

export class BufferedReader {
  #stream: AsyncIterableIterator<Uint8Array<ArrayBufferLike>>;
  #buffer: Uint8Array | null;

  constructor(stream: AsyncIterableIterator<Uint8Array>) {
    this.#stream = stream;
  }

  async readBytes(size: number): Promise<Uint8Array | null> {
    if (typeof size !== "number") {
      throw new Error(`Size must be a number, got '${size}'`);
    }

    while (!this.#buffer || this.#buffer.length < size) {
      const result = await this.#stream.next();

      if (result.done) {
        return null;
      }

      this.#buffer = concat(this.#buffer ?? new Uint8Array(0), result.value);
    }

    const chunk = this.#buffer.slice(0, size);
    this.#buffer = this.#buffer.slice(size);
    return chunk;
  }
}
