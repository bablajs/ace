// deno-lint-ignore-file no-explicit-any
// @ts-types="npm:@types/yargs-parser"
import yargsParser from "yargs-parser";

import {
  ArgumentsParserOptions,
  FlagsParserOptions,
  ParsedOutput,
  YargsOutput,
} from "#types";
import { yargsConfig } from "#src/yargs_config.ts";

export class Parser {
  constructor(
    private readonly options: {
      flagsParserOptions: FlagsParserOptions;
      argumentsParserOptions: ArgumentsParserOptions[];
    },
  ) {}

  private parseFlags(argv: string | string[]) {
    return yargsParser(argv, {
      ...this.options.flagsParserOptions,
      configuration: yargsConfig,
    });
  }

  private scanUnknownFlags(parsed: { [key: string]: any }): string[] {
    const unknownFlags: string[] = [];
    for (const key of Object.keys(parsed)) {
      if (!this.options.flagsParserOptions.all.includes(key)) {
        unknownFlags.push(key);
      }
    }
    return unknownFlags;
  }

  private parseArguments(parsedOutput: YargsOutput): ParsedOutput {
    let lastParsedIndex = -1;

    const output = this.options.argumentsParserOptions.map((option, index) => {
      if (option.type === "spread") {
        let value: any[] | undefined = parsedOutput._.slice(index);
        lastParsedIndex = parsedOutput._.length;

        /**
         * Step 1
         *
         * Use default value when original value is not defined.
         */
        if (!value.length) {
          value = Array.isArray(option.default)
            ? option.default
            : option.default === undefined
            ? undefined
            : [option.default];
        }

        /**
         * Step 2
         *
         * Call parse method when value is not undefined
         */
        if (value !== undefined && option.parse) {
          value = option.parse(value);
        }

        return value;
      }

      let value = parsedOutput._[index];
      lastParsedIndex = index + 1;

      /**
       * Step 1:
       *
       * Use default value when original value is undefined
       * Original value set to empty string will be used
       * as real value. The behavior is same as yargs
       * flags parser `--connection=`
       */
      if (value === undefined) {
        value = option.default;
      }

      /**
       * Step 2
       *
       * Call parse method when value is not undefined
       */
      if (value !== undefined && option.parse) {
        value = option.parse(value);
      }

      return value;
    });

    const { "_": args, "--": o, ...rest } = parsedOutput;

    return {
      args: output,
      nodeArgs: [],
      _: args.slice(lastParsedIndex === -1 ? 0 : lastParsedIndex),
      unknownFlags: this.scanUnknownFlags(rest),
      flags: rest,
    };
  }

  parse(argv: string | string[]): ParsedOutput {
    return this.parseArguments(this.parseFlags(argv));
  }
}
