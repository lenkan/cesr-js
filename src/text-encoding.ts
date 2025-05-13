export function encodeUTF8(input: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(input);
}

export function decodeUTF8(input: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(input);
}
