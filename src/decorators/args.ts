// deno-lint-ignore-file no-explicit-any
import { SpreadArgument, StringArgument } from "#types";
import { BaseCommand } from "#src/commands/base.ts";

export const args = {
  string<Type = string>(options?: Partial<Omit<StringArgument<Type>, "type">>) {
    return function stringDecorator<This, Value>(
      value: undefined,
      context: ClassFieldDecoratorContext<This, Value>,
    ) {
      if (context.kind === "field") {
        context.addInitializer?.(function (this: This) {
          const Command = context.constructor as typeof BaseCommand;
          Command.defineArgument(context.name as string, {
            ...options,
            type: "string",
          });
        });
      }
      return value;
    };
  },

  spread<Type extends any = string[]>(
    options?: Partial<Omit<SpreadArgument<Type>, "type">>,
  ) {
    return function spreadDecorator<This, Value>(
      value: undefined,
      context: ClassFieldDecoratorContext<This, Value>,
    ) {
      if (context.kind === "field") {
        context.addInitializer?.(function (this: This) {
          const Command = context.constructor as typeof BaseCommand;
          Command.defineArgument(context.name as string, {
            ...options,
            type: "spread",
          });
        });
      }
      return value;
    };
  },
};
