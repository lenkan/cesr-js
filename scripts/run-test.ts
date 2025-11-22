import { run } from "node:test";
import { spec } from "node:test/reporters";
import { parseArgs } from "node:util";

const {
  positionals,
  values: { watch },
} = parseArgs({
  args: process.argv.slice(2),
  options: {
    watch: { type: "boolean", default: false },
  },
  strict: false,
});

run({
  globPatterns: positionals.length ? positionals : ["src/**/*.test.ts"],
  watch: watch as boolean,
  concurrency: true,
})
  .on("test:fail", () => {
    process.exitCode = 1;
  })
  .compose(spec())
  .pipe(process.stdout);
