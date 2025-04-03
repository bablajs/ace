// deno-lint-ignore-file no-explicit-any
import Macroable from "@poppinss/macroable";
import string from "@poppinss/utils/string";
import type { Prompt } from "@poppinss/prompts";
import lodash from "@poppinss/utils/lodash";
import {
  defineStaticProperty,
  InvalidArgumentsException,
} from "@poppinss/utils";

import { Kernel } from "#src/kernel.ts";
import debug from "#src/debug.ts";
import * as errors from "#src/errors.ts";
import {
  Argument,
  ArgumentsParserOptions,
  CommandMetaData,
  CommandOptions,
  Flag,
  FlagsParserOptions,
  ParsedOutput,
  UIPrimitives,
} from "#types";
import { Colors } from "@poppinss/cliui/types";
import { Logger } from "@poppinss/cliui";

export class BaseCommand extends Macroable {
  static booted: boolean = false;

  static options: CommandOptions;

  static aliases: string[];

  static commandName: string;

  static description: string;

  static help?: string | string[];

  static args: Argument[];

  static flags: Flag[];

  static boot() {
    if (Object.hasOwn(this, "booted") && this.booted) return;
    this.booted = true;
    defineStaticProperty(this, "args", {
      initialValue: [],
      strategy: "inherit",
    });
    defineStaticProperty(this, "flags", {
      initialValue: [],
      strategy: "inherit",
    });
    defineStaticProperty(this, "aliases", {
      initialValue: [],
      strategy: "inherit",
    });
    defineStaticProperty(this, "commandName", {
      initialValue: "",
      strategy: "inherit",
    });
    defineStaticProperty(this, "description", {
      initialValue: "",
      strategy: "inherit",
    });
    defineStaticProperty(this, "help", {
      initialValue: "",
      strategy: "inherit",
    });
    defineStaticProperty(this, "options", {
      initialValue: { staysAlive: false, allowUnknownFlags: false },
      strategy: "inherit",
    });
  }

  static defineArgument(
    name: string,
    options: Partial<Argument> & { type: "string" | "spread" },
  ) {
    this.boot();
    const arg = {
      name,
      argumentName: string.dashCase(name),
      required: true,
      ...options,
    };
    const lastArg = this.args[this.args.length - 1];

    if (!arg.type) {
      throw new InvalidArgumentsException(
        `Cannot define argument "${this.name}". Specify the type of the argument`,
      );
    }

    if (lastArg && lastArg.type === "spread") {
      throw new InvalidArgumentsException(
        `Cannot define argument "${this.name}.${name}" after spread argument "${this.name}.${lastArg.name}". Spread argument should be the last one`,
      );
    }

    if (arg.required && lastArg && lastArg.required === false) {
      throw new InvalidArgumentsException(
        `Cannot define required argument "${this.name}.${name}" after optional argument "${this.name}.${lastArg.name}"`,
      );
    }

    if (debug.enabled) {
      debug("defining arg %O, command: %O", arg, `[class: ${this.name}]`);
    }

    this.args.push(arg);
  }

  static defineFlag(
    name: string,
    options: Partial<Flag> & {
      type: "string" | "boolean" | "number" | "array";
    },
  ) {
    this.boot();
    const flag = {
      name,
      flagName: string.dashCase(name),
      required: false,
      ...options,
    };

    if (!flag.type) {
      throw new InvalidArgumentsException(
        `Cannot define flag "${this.name}.${name}". Specify the type of the flag`,
      );
    }

    if (debug.enabled) {
      debug("defining flag %O, command: %O", flag, `[class: ${this.name}]`);
    }

    this.flags.push(flag);
  }

  static getParserOptions(
    options?: FlagsParserOptions,
  ): {
    flagsParserOptions: Required<FlagsParserOptions>;
    argumentsParserOptions: ArgumentsParserOptions[];
  } {
    this.boot();

    const argumentsParserOptions: ArgumentsParserOptions[] = this.args.map(
      (arg) => ({ type: arg.type, default: arg.default, parse: arg.parse }),
    );

    const flagsParserOptions: Required<FlagsParserOptions> = lodash.merge({
      all: [],
      string: [],
      boolean: [],
      array: [],
      number: [],
      alias: {},
      count: [],
      coerce: {},
      default: {},
    }, options);

    this.flags.forEach((flag) => {
      flagsParserOptions.all.push(flag.flagName);
      if (flag.alias) {
        flagsParserOptions.alias[flag.flagName] = flag.flagName;
      }
      if (flag.parse) {
        flagsParserOptions.coerce[flag.flagName] = flag.parse;
      }
      if (flag.default !== undefined) {
        flagsParserOptions.default[flag.flagName] = flag.default;
      }

      switch (flag.type) {
        case "string":
          flagsParserOptions.string.push(flag.flagName);
          break;
        case "boolean":
          flagsParserOptions.boolean.push(flag.flagName);
          break;
        case "number":
          flagsParserOptions.number.push(flag.flagName);
          break;
        case "array":
          flagsParserOptions.array.push(flag.flagName);
          break;
      }
    });

    return {
      flagsParserOptions,
      argumentsParserOptions,
    };
  }

  static serialize(): CommandMetaData {
    this.boot();
    if (!this.commandName) {
      throw new errors.E_MISSING_COMMAND_NAME([this.name]);
    }

    const [namespace, name] = this.commandName.split(":");
    return {
      commandName: this.commandName,
      description: this.description,
      help: this.help,
      namespace: name ? namespace : null,
      aliases: this.aliases,
      flags: this.flags.map((flag) => {
        const { parse: _, ...rest } = flag;
        return rest;
      }),
      args: this.args.map((arg) => {
        const { parse: _, ...rest } = arg;
        return rest;
      }),
      options: this.options,
    };
  }

  static validate(parsedOutput: ParsedOutput) {
    this.boot();

    this.args.forEach((arg, index) => {
      const value = parsedOutput.args[index] as string;
      const hasDefinedArgument = value !== undefined;

      if (arg.required && !hasDefinedArgument) {
        throw new errors.E_MISSING_ARG([arg.name]);
      }

      if (
        hasDefinedArgument && !arg.allowEmptyValue &&
        (value === "" || !value.length)
      ) {
        if (debug.enabled) {
          debug('disallowing empty value "%s" for arg: "%s"', value, arg.name);
        }

        throw new errors.E_MISSING_ARG_VALUE([arg.name]);
      }
    });

    if (!this.options.allowUnknownFlags && parsedOutput.unknownFlags.length) {
      const unknowFlag = parsedOutput.unknownFlags[0];
      const unknowFlagName = unknowFlag.length === 1
        ? `-${unknowFlag}`
        : `--${unknowFlag}`;
      throw new errors.E_UNKNOWN_FLAG([unknowFlagName]);
    }

    this.flags.forEach((flag) => {
      const hasMentionedFlag = Object.hasOwn(parsedOutput.flags, flag.flagName);
      const value = parsedOutput.flags[flag.flagName];

      switch (flag.type) {
        case "boolean":
          if (flag.required && !hasMentionedFlag) {
            throw new errors.E_MISSING_FLAG([flag.flagName]);
          }
          break;
        case "number":
          if (flag.required && !hasMentionedFlag) {
            throw new errors.E_MISSING_FLAG([flag.flagName]);
          }

          if (hasMentionedFlag && value === undefined) {
            throw new errors.E_MISSING_FLAG_VALUE([flag.flagName]);
          }

          if (Number.isNaN(value)) {
            throw new errors.E_INVALID_FLAG([flag.flagName, "numeric"]);
          }
          break;
        case "string":
        case "array":
          if (flag.required && !hasMentionedFlag) {
            throw new errors.E_MISSING_FLAG([flag.flagName]);
          }

          if (
            hasMentionedFlag && !flag.allowEmptyValue &&
            (value === "" || !value.length)
          ) {
            if (debug.enabled) {
              debug(
                'disallowing empty value "%s" for flag: "%s"',
                value,
                flag.name,
              );
            }

            throw new errors.E_MISSING_FLAG_VALUE([flag.flagName]);
          }
      }
    });
  }

  protected hydrated: boolean = false;

  exitCode?: number;

  error?: any;

  result?: any;

  get logger(): Logger {
    return this.ui.logger;
  }

  get colors(): Colors {
    return this.ui.colors;
  }

  // get isMain(): boolean {
  //   return this.kernel.getMainCommand() === this;
  // }

  constructor(
    protected kernel: Kernel<any>,
    protected parsed: ParsedOutput,
    public ui: UIPrimitives,
    public prompt: Prompt,
  ) {
    super();
  }
}
