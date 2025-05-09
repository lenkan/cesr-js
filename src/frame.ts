import type { CounterV1, CounterV2 } from "./counter.ts";
import type { Indexer } from "./indexer.ts";
import type { Matter } from "./matter.ts";
import type { Message } from "./version.ts";

export type Frame = Message | Matter | CounterV1 | CounterV2 | Indexer;
