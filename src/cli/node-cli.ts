#!/usr/bin/env node
import { createReadStream } from "node:fs";
import process from "node:process";
import { execute } from "./cli.ts";

async function* resolveInputStream(input: string): AsyncIterableIterator<Uint8Array> {
  if (input === "-") {
    yield* process.stdin;
    return;
  }

  if (input.startsWith("http") || input.startsWith("https")) {
    const response = await fetch(input);
    if (response.body) {
      for await (const chunk of response.body) {
        yield chunk;
      }
    }

    return;
  }

  const stream = createReadStream(input);

  for await (const chunk of stream) {
    yield chunk;
  }

  stream.close();
}

try {
  await execute({
    args: process.argv.slice(2),
    read: resolveInputStream,
  });
} catch (error) {
  if (error instanceof Error) {
    process.stderr.write("Error: ");
    process.stderr.write(error.message);
    process.stderr.write("\n");
  }
  process.exit(1);
}
