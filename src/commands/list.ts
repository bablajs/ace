import { args } from "#src/decorators/args.ts";
import { BaseCommand } from "#src/commands/base.ts";
import { flags } from "#src/decorators/flags.ts";
import { CommandMetaData, Flag, ListTable } from "#types";
import { CommandFormatter } from "#src/formatters/command.ts";
import { FlagFormatter } from "#src/formatters/flag.ts";

export class ListCommand extends BaseCommand {
  static override commandName: string = "list";
  static override description: string = "View list of available commands";
  static override help = [
    "The list command displays a list of all the commands:",
    "  {{ binaryName }} list",
    "",
    "You can also display the commands for a specific namespace:",
    "  {{ binaryName }} list <namespace...>",
  ];

  @args.spread({
    description: "Filter list by namespace",
    required: false,
  })
  namespaces?: string[];

  @flags.boolean({ description: "Get list of commands as JSON" })
  json?: boolean;

  // private makeCommandsTable(
  //   heading: string,
  //   commands: CommandMetaData[],
  // ): ListTable {
  //   return {
  //     heading: this.colors.yellow(heading),
  //     columns: commands.map((command) => {
  //       const aliases = this.kernel.getCommandAliases(command.commandName);
  //       const commandFormatter = new CommandFormatter(command, this.colors);

  //       return {
  //         option: commandFormatter.formatListName(aliases),
  //         description: commandFormatter.formatListDescription(),
  //       };
  //     }),
  //   };
  // }

  // private makeOptionsTable(heading: string, flagsList: Flag[]): ListTable {
  //   return {
  //     heading: this.colors.yellow(heading),
  //     columns: flagsList.map((flag) => {
  //       const flagFormatter = new FlagFormatter(flag, this.colors);

  //       return {
  //         option: flagFormatter.formatOption(),
  //         description: flagFormatter.formatDescription(),
  //       };
  //     }),
  //   };
  // }
}
