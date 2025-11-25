import { decodeUtf8 } from "./encoding-utf8.ts";

export interface CodeTableEntryInit {
  hs: number;
  fs?: number;
  ss?: number;
  os?: number;
  ls?: number;
  xs?: number;
}

export type CodeTableInit = Record<string, CodeTableEntryInit>;

export interface CodeTableEntry {
  hs: number;
  fs: number;
  ss: number;
  os: number;
  ls: number;
  xs: number;
}

export interface CodeTableOptions {
  /**
   * Strict lookup rules - throws if codes are not in the provided table
   */
  strict?: boolean;
  matter?: CodeTableInit;
  indexer?: CodeTableInit;
}

export function resolveEntry(init: CodeTableEntryInit): CodeTableEntry {
  return {
    hs: init.hs,
    fs: init.fs ?? 0,
    ls: init.ls ?? 0,
    os: init.os ?? 0,
    ss: init.ss ?? 0,
    xs: init.xs ?? 0,
  };
}

export class CodeTable {
  #table: Record<string, CodeTableEntry> = {};
  #hards: Record<string, number> = {};

  constructor(table: CodeTableInit) {
    for (const [key, value] of Object.entries(table)) {
      this.#hards[key.slice(0, 1)] = value.hs;
      this.#table[key] = resolveEntry(value);
    }
  }

  /**
   * Finds the size table of a code
   * @param input The input to parse the code from
   */
  lookup(input: string | Uint8Array): CodeTableEntry {
    if (typeof input !== "string") {
      input = decodeUtf8(input.slice(0, 4));
    }

    if (input.length === 0) {
      throw new Error("Received empty input code for lookup");
    }

    const hs = this.#hards[input.slice(0, 1)];
    const hard = input.slice(0, hs ?? 4);
    const entry = this.#table[hard];

    if (!entry) {
      throw new Error(`Unknown code ${hard}`);
    }

    return entry;
  }
}

export function lookupCounterSize(input: Uint8Array | string): CodeTableEntry {
  if (typeof input !== "string") {
    input = decodeUtf8(input.slice(0, 4));
  }

  switch (input.charAt(0)) {
    case "-":
      switch (input.charAt(1)) {
        case "-":
          return resolveEntry({ hs: 3, ss: 5, fs: 8 });
        case "_":
          return resolveEntry({ hs: 5, ss: 3, fs: 8 });
        default:
          return resolveEntry({ hs: 2, ss: 2, fs: 4 });
      }
  }

  throw new Error(`Unknown code ${input.slice(0, 4)}`);
}
