import { Matter } from "./matter.ts";
import { Indexer } from "./indexer.ts";

/**
 * CESR Codec
 */
export class Codec {
  readonly crypto = Matter.crypto;
  readonly primitive = Matter.primitive;
  readonly indexer = Indexer.crypto;
}
