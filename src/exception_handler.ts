// deno-lint-ignore-file no-explicit-any
import * as errors from "#src/errors.ts";
import { Kernel } from "#src/kernel.ts";

export class ExceptionHandler {
  debug: boolean = true;

  protected knownErrorCodes: string[] = [];

  protected internalKnownErrorCodes: string[] = Object.keys(errors);

  // protected logError(error: { message: any } & unknown, kernel: Kernel<any>) {
  //   kernel.ui.logger.logError(
  //     `${kernel.ui.colors.bgRed().white("  ERROR  ")} ${error.message}`,
  //   );
  // }
}
