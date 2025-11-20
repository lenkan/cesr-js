export function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
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

export function prepad(raw: Uint8Array, length: number): Uint8Array {
  if (raw.byteLength === length) {
    return raw;
  }

  const padded = new Uint8Array(length + raw.byteLength);
  padded.set(raw, length);
  return padded;
}

export function toArray(num: number, length: number): Uint8Array {
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[length - i - 1] = num % 256;
    num = Math.floor(num / 256);
  }

  return bytes;
}
