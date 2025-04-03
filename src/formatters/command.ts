import string from "@poppinss/utils/string";
import { TERMINAL_SIZE, wrap } from "@poppinss/cliui/helpers";
import { AllowedInfoValues, CommandMetaData, UIPrimitives } from "#types";
import { ArgumentFormatter } from "#src/formatters/argument.ts";

export class CommandFormatter {
  constructor(
    private readonly command: CommandMetaData,
    private readonly colors: UIPrimitives["colors"],
  ) {}

  formatListName(aliases: string[]): string {
    const formattedAliases = aliases.length
      ? ` ${this.colors.dim(`(${aliases.join(", ")})`)}`
      : "";
    return `  ${
      this.colors.green(this.command.commandName)
    }${formattedAliases}`;
  }

  formatDescription(): string {
    return this.command.description || "";
  }

  formatHelp(
    binaryName?: AllowedInfoValues,
    terminalWidth: number = TERMINAL_SIZE,
  ): string {
    const binary = binaryName ? `${binaryName}` : "";
    if (!this.command.help) {
      return "";
    }

    const help = Array.isArray(this.command.help)
      ? this.command.help
      : [this.command.help];

    return wrap(
      help.map((line) => string.interpolate(line, { binaryName: binary })),
      {
        startColumn: 2,
        trimStart: false,
        endColumn: terminalWidth,
      },
    ).join("\n");
  }

  formatListDescription(): string {
    if (!this.command.description) {
      return "";
    }
    return this.colors.dim(this.command.description);
  }

  formatUsage(aliases: string[], binaryName?: AllowedInfoValues): string[] {
    const binary = binaryName ? `${binaryName} ` : "";

    /**
     * Display options placeholder for flags
     */
    const flags = this.command.flags.length ? this.colors.dim("[options]") : "";

    /**
     * Display a list of named args
     */
    const args = this.command.args
      .map((arg) => new ArgumentFormatter(arg, this.colors).formatOption())
      .join(" ");

    /**
     * Separator between options placeholder and args
     */
    const separator = flags && args ? ` ${this.colors.dim("[--]")} ` : "";

    const mainUsage = [
      `  ${binary}${this.command.commandName} ${flags}${separator}${args}`,
    ];
    return mainUsage.concat(
      aliases.map((alias) => `  ${binary}${alias} ${flags}${separator}${args}`),
    );
  }
}
