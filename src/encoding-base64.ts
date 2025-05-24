const B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");

function getBase64Index(char: string): number {
  if (char === "=") {
    return 0;
  }

  const code = B64_ALPHABET.indexOf(char);

  if (code === -1) {
    throw new Error(`Invalid base64 character '${char}'`);
  }

  return code;
}

export function decodeBase64Int(str: string): number {
  let result = 0;

  for (let i = str.length - 1; i >= 0; i--) {
    const character = str.charAt(i);

    const index = getBase64Index(character);

    const factor = 64 ** (str.length - i - 1);
    result += factor * index;
  }

  return result;
}

export function encodeBase64Int(value: number, length?: number): string {
  if (length !== undefined && value >= 64 ** length) {
    throw new Error(`value ${value} too big for base64 length ${length}`);
  }

  let remainder = value;
  let result = "";

  while (remainder !== 0) {
    result = B64_ALPHABET[remainder % 64] + result;
    remainder = Math.floor(remainder / 64);
  }

  return result.padStart(length ?? 1, "A");
}

export function encodeBase64Url(uint8: Uint8Array): string {
  // CREDIT: https://github.com/denoland/std/blob/main/encoding/base64.ts
  // CREDIT: https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727
  let result = "";
  let i: number;
  const l = uint8.length;
  for (i = 2; i < l; i += 3) {
    result += B64_ALPHABET[uint8[i - 2] >> 2];
    result += B64_ALPHABET[((uint8[i - 2] & 0x03) << 4) | (uint8[i - 1] >> 4)];
    result += B64_ALPHABET[((uint8[i - 1] & 0x0f) << 2) | (uint8[i] >> 6)];
    result += B64_ALPHABET[uint8[i] & 0x3f];
  }
  if (i === l + 1) {
    // 1 octet yet to write
    result += B64_ALPHABET[uint8[i - 2] >> 2];
    result += B64_ALPHABET[(uint8[i - 2] & 0x03) << 4];
  }
  if (i === l) {
    // 2 octets yet to write
    result += B64_ALPHABET[uint8[i - 2] >> 2];
    result += B64_ALPHABET[((uint8[i - 2] & 0x03) << 4) | (uint8[i - 1] >> 4)];
    result += B64_ALPHABET[(uint8[i - 1] & 0x0f) << 2];
  }
  return result;
}

export function decodeBase64Url(input: string): Uint8Array {
  if (typeof input !== "string") {
    throw new Error(`input must be a string`);
  }

  if (input.length === 0) {
    return new Uint8Array(0);
  }

  const remainder = input.length % 4;
  const padSize = remainder > 0 ? 4 - remainder : remainder;
  const str = input.padEnd(padSize + input.length, "=");

  const result = new Uint8Array(3 * (str.length / 4));

  for (let i = 0, j = 0; i < str.length; i += 4, j += 3) {
    const sixtet0 = getBase64Index(str.charAt(i)) << 18;
    const sixtet1 = getBase64Index(str.charAt(i + 1)) << 12;
    const sixtet2 = getBase64Index(str.charAt(i + 2)) << 6;
    const sixtet3 = getBase64Index(str.charAt(i + 3));

    const chunk = sixtet0 | sixtet1 | sixtet2 | sixtet3;

    result[j] = chunk >> 16;
    result[j + 1] = (chunk >> 8) & 0xff;
    result[j + 2] = chunk & 0xff;
  }

  return result.slice(0, result.length - padSize);
}
