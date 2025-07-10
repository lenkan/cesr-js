import test from "node:test";
import assert from "node:assert/strict";
import { lshift } from "./shifting.ts";

function t(input: number, bits: number, result: number): [string, () => void] {
  return [`Should shift ${input} << ${bits} => ${result}`, () => assert.equal(lshift(input, bits), result)];
}

test(...t(2, 1, 4));
test(...t(2, 2, 8));
test(...t(259484760932357, 0, 259484760932357));
test(...t(259484760932357, 1, 518969521864714));
