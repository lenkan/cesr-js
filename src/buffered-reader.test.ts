import assert from "node:assert";
import { test } from "node:test";
import { BufferedReader } from "./buffered-reader.ts";

async function* chunked(data: Uint8Array, size = 100): AsyncIterableIterator<Uint8Array> {
  let index = 0;

  while (index < data.byteLength) {
    yield data.slice(index, index + size);
    index += size;
  }
}

test("Read chunked stream", async () => {
  const data = chunked(new Uint8Array(Array.from({ length: 100 }).map((_, idx) => idx)), 10);
  const reader = new BufferedReader(data);

  const chunk0 = await reader.readBytes(8);
  assert(chunk0);
  assert.equal(chunk0[0], 0);

  const chunk1 = await reader.readBytes(4);
  assert(chunk1);
  assert.deepEqual(chunk1, Uint8Array.from([8, 9, 10, 11]));
});
