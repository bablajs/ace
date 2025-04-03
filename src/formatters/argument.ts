import { Argument, UIPrimitives } from "#types";

export class ArgumentFormatter {
  constructor(
    private readonly argument: Argument,
    private readonly colors: UIPrimitives["colors"],
  ) {}

  private formatArgument(argument: Argument, valuePlaceholder: string): string {
    return argument.required ? `${valuePlaceholder}` : `[${valuePlaceholder}]`;
  }

  formatDescription(): string {
    const defaultValue = this.argument.default
      ? `[default: ${this.argument.default}]`
      : "";
    const separator = defaultValue && this.argument.description ? " " : "";
    return this.colors.dim(
      `${this.argument.description || ""}${separator}${defaultValue}`,
    );
  }

  formatListOption(): string {
    switch (this.argument.type) {
      case "spread":
        return `  ${
          this.colors.green(
            this.formatArgument(
              this.argument,
              `${this.argument.argumentName}...`,
            ),
          )
        }  `;
      case "string":
        return `  ${
          this.colors.green(
            this.formatArgument(this.argument, `${this.argument.argumentName}`),
          )
        }  `;
    }
  }

  formatOption(): string {
    switch (this.argument.type) {
      case "spread":
        return this.colors.dim(
          `${
            this.formatArgument(
              this.argument,
              `<${this.argument.argumentName}...>`,
            )
          }`,
        );
      case "string":
        return this.colors.dim(
          `${
            this.formatArgument(
              this.argument,
              `<${this.argument.argumentName}>`,
            )
          }`,
        );
    }
  }
}
