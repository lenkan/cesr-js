const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const B64_URL_MAP = ALPHABET.split("");
const B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");

export function encodeBase64(uint8: Uint8Array): string {
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
    result += "==";
  }
  if (i === l) {
    // 2 octets yet to write
    result += B64_ALPHABET[uint8[i - 2] >> 2];
    result += B64_ALPHABET[((uint8[i - 2] & 0x03) << 4) | (uint8[i - 1] >> 4)];
    result += B64_ALPHABET[(uint8[i - 1] & 0x0f) << 2];
    result += "=";
  }
  return result;
}

export function decodeBase64(b64: string): Uint8Array {
  // CREDIT: https://github.com/denoland/std/blob/main/encoding/base64.ts
  const binString = atob(b64);
  const size = binString.length;
  const bytes = new Uint8Array(size);

  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i);
  }

  return bytes;
}

export function decodeBase64Int(value: string): number {
  return value
    .split("")
    .reverse()
    .reduce((result, character, index) => {
      const value = ALPHABET.indexOf(character);
      const factor = 64 ** index;
      return result + value * factor;
    }, 0);
}

export function encodeBase64Int(value: number, length = 1): string {
  let current = value;
  let result = "";
  while (length != 0) {
    result = B64_URL_MAP[current % 64] + result;
    current = Math.floor(current / 64);
    if (current == 0) {
      break;
    }
  }

  return result.padStart(length, "A");
}

export function encodeBase64Url(buffer: Uint8Array): string {
  return encodeBase64(buffer).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+/, "");
}

export function decodeBase64Url(input: string): Uint8Array {
  if (!(typeof input === "string")) {
    throw new TypeError("`input` must be a string.");
  }

  const n = input.length % 4;
  const padded = input + "=".repeat(n > 0 ? 4 - n : n);
  const base64String = padded.replace(/-/g, "+").replace(/_/g, "/");

  return decodeBase64(base64String);
}
