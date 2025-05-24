export function encodeUtf8(text: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(text);
}

export function decodeUtf8(bytes: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}
