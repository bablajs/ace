import { ArrayFlag, BooleanFlag, NumberFlag, StringFlag } from "#types";
import { BaseCommand } from "#src/commands/base.ts";

export const flags = {
  string<Type = string>(options?: Partial<Omit<StringFlag<Type>, "type">>) {
    return function stringFlagDecorator<This, Value>(
      value: undefined,
      context: ClassFieldDecoratorContext<This, Value>,
    ) {
      if (context.kind === "field") {
        context.addInitializer?.(function (this: This) {
          const Command = context.constructor as typeof BaseCommand;
          Command.defineFlag(context.name as string, {
            type: "string",
            ...options,
          });
        });
      }
      return value;
    };
  },
  boolean<Type = boolean>(options?: Partial<Omit<BooleanFlag<Type>, "type">>) {
    return function booleanFlagDecorator<This, Value>(
      value: undefined,
      context: ClassFieldDecoratorContext<This, Value>,
    ) {
      if (context.kind === "field") {
        context.addInitializer?.(function (this: This) {
          const Command = context.constructor as typeof BaseCommand;
          Command.defineFlag(context.name as string, {
            type: "boolean",
            ...options,
          });
        });
      }
      return value;
    };
  },

  number<Type = number>(options?: Partial<Omit<NumberFlag<Type>, "type">>) {
    return function numberFlagDecorator<This, Value>(
      value: undefined,
      context: ClassFieldDecoratorContext<This, Value>,
    ) {
      if (context.kind === "field") {
        context.addInitializer?.(function (this: This) {
          const Command = context.constructor as typeof BaseCommand;
          Command.defineFlag(context.name as string, {
            type: "number",
            ...options,
          });
        });
      }
      return value;
    };
  },

  array<Type = any>(options?: Partial<Omit<ArrayFlag<Type>, "type">>) {
    return function arrayFlagDecorator<This, Value>(
      value: undefined,
      context: ClassFieldDecoratorContext<This, Value>,
    ) {
      if (context.kind === "field") {
        context.addInitializer?.(function (this: This) {
          const Command = context.constructor as typeof BaseCommand;
          Command.defineFlag(context.name as string, {
            type: "array",
            ...options,
          });
        });
      }
      return value;
    };
  },
};
