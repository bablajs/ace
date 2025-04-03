// deno-lint-ignore-file no-explicit-any
import { AbstractBaseCommand, ExecutorContract } from "#types";
import { ExceptionHandler } from "#src/exception_handler.ts";
import { BaseCommand } from "#src/commands/base.ts";
import { ListCommand } from "#src/commands/list.ts";

export class Kernel<Command extends AbstractBaseCommand> {
  // errorHandler: {
  //   render(error: unknown, kernel: Kernel<any>): Promise<any>;
  // } = new ExceptionHandler();

  // static commandExecutor: ExecutorContract<typeof BaseCommand> = {
  //   create(command, parsedArgs, kernel) {
  //     return new command(kernel, parsedArgs, kernel.ui, kernel.prompt);
  //   },
  //   run(command) {
  //     return command.exec();
  //   },
  // };

  // static defaultCommand: typeof BaseCommand = ListCommand;

  constructor(
    private readonly defaultCommand: Command,
    private readonly executor: ExecutorContract<Command>,
  ) {}
}
