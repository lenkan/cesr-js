/* eslint-disable no-console */
import { parse } from "../parse.ts";

interface Arguments {
  options: Record<string, string | boolean>;
  _: string[];
  helpText: string;
}

interface Option {
  choices?: string[];
  description: string;
}

function parseArgs(inputArgs: string[], opts: Record<string, Option>): Arguments {
  const helpText = [
    `Usage: cesr [options] <input>`,
    "",
    "Parses an input CESR stream.",
    "",
    "Arguments:",
    "  <input>  The input file to parse. Use '-' for stdin. Can also be a URL.",
    "",
    "Options:",
    ...Object.entries(opts).map(([key, value]) => {
      return `  ${key} ${value.description}`;
    }),
  ].join("\n");

  const args: string[] = [];
  const options: Record<string, string | boolean> = {};

  inputArgs.forEach((arg) => {
    if (!arg.startsWith("--")) {
      args.push(arg);
      return;
    }

    if (arg.includes("=")) {
      const [key, value] = arg.split("=");
      options[key] = value;
      return;
    }

    options[arg] = true;
  });

  return {
    _: args,
    options,
    helpText,
  };
}

export interface CommandLineInterface {
  args: string[];
  read(input: string): AsyncIterableIterator<Uint8Array>;
}

function formatError(message: string, help: string): string {
  return `Error: ${message}\n\n${help}`;
}

export async function execute(cli: CommandLineInterface) {
  const app = parseArgs(cli.args, {
    "--help": {
      description: "Show help",
    },
    "--pretty": {
      description: "Pretty print the output",
    },
  });

  const input = app.options["--input"] || app._[0];

  if (app.options["--help"]) {
    console.log(app.helpText);
    return;
  }

  if (typeof input !== "string" || input.length === 0) {
    throw new Error(formatError("No input file specified.", app.helpText));
  }

  const stream = cli.read(input);

  for await (const message of parse(stream)) {
    if (app.options["--pretty"]) {
      console.dir(message, { depth: 100, colors: true });
    } else {
      console.log(JSON.stringify(message));
    }
  }
}
