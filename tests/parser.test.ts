import { assertEquals } from "@std/assert";
import { describe, test } from "@std/testing/bdd";

import { BaseCommand } from "#src/commands/base.ts";
import { Parser } from "#src/parser.ts";

describe("Parser | flags", () => {
  test("parse flags from all datatypes", () => {
    class MakeModel extends BaseCommand {}

    MakeModel.defineFlag("connection", { type: "string" });
    MakeModel.defineFlag("dropAll", { type: "boolean" });
    MakeModel.defineFlag("batchSize", { type: "number" });
    MakeModel.defineFlag("files", { type: "array" });

    assertEquals(
      new Parser(MakeModel.getParserOptions()).parse(
        "--connection=sqlite --drop-all --batch-size=1 --files=a,b",
      ),
      {
        _: [],
        nodeArgs: [],
        args: [],
        unknownFlags: [],
        flags: {
          "batch-size": 1,
          connection: "sqlite",
          "drop-all": true,
          files: ["a,b"],
        },
      },
    );

    assertEquals(
      new Parser(MakeModel.getParserOptions()).parse("--files=a --files=b"),
      {
        _: [],
        nodeArgs: [],
        args: [],
        unknownFlags: [],
        flags: {
          files: ["a", "b"],
        },
      },
    );
  });

  test("use default value when argument is not mentioned", () => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument("name", { type: "string" });
    MakeModel.defineArgument("connections", {
      type: "spread",
      default: ["sqlite"],
    });

    const output = new Parser(MakeModel.getParserOptions()).parse("user");

    assertEquals(output, {
      _: [],
      nodeArgs: [],
      args: ["user", ["sqlite"]],
      unknownFlags: [],
      flags: {},
    });
  });

  test("do not use default value when argument is mentioned as empty string", () => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument("name", { type: "string" });
    MakeModel.defineArgument("connections", {
      type: "spread",
      default: ["sqlite"],
    });

    const output = new Parser(MakeModel.getParserOptions()).parse(["user", ""]);

    assertEquals(output, {
      _: [],
      nodeArgs: [],
      args: ["user", [""]],
      unknownFlags: [],
      flags: {},
    });
  });

  test("call parse method", () => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument("name", {
      type: "string",
      parse(value) {
        return value.toUpperCase();
      },
    });
    MakeModel.defineArgument("connections", {
      type: "spread",
      parse(values) {
        return values.map((value: string) => value.toUpperCase());
      },
    });

    const output = new Parser(MakeModel.getParserOptions()).parse([
      "user",
      "sqlite",
      "pg",
    ]);

    assertEquals(output, {
      _: [],
      nodeArgs: [],
      args: ["USER", ["SQLITE", "PG"]],
      unknownFlags: [],
      flags: {},
    });
  });

  test("call parse method on default value", () => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument("name", {
      type: "string",
      default: "post",
      parse(value) {
        return value.toUpperCase();
      },
    });
    MakeModel.defineArgument("connections", {
      type: "spread",
      default: ["sqlite"],
      parse(values) {
        return values.map((value: string) => value.toUpperCase());
      },
    });

    const output = new Parser(MakeModel.getParserOptions()).parse([]);

    assertEquals(output, {
      _: [],
      nodeArgs: [],
      args: ["POST", ["SQLITE"]],
      unknownFlags: [],
      flags: {},
    });
  });

  test("do not call parse when value is undefined", () => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument("name", {
      type: "string",
      parse(value) {
        return value.toUpperCase();
      },
    });
    MakeModel.defineArgument("connections", {
      type: "spread",
      parse(values) {
        return values.map((value: string) => value.toUpperCase());
      },
    });

    const output = new Parser(MakeModel.getParserOptions()).parse([]);

    assertEquals(output, {
      _: [],
      nodeArgs: [],
      args: [undefined, undefined],
      unknownFlags: [],
      flags: {},
    });
  });

  test("cast spread default value to array", () => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument("name", {
      type: "string",
    });
    MakeModel.defineArgument("connections", {
      type: "spread",
      default: 1,
    });

    const output = new Parser(MakeModel.getParserOptions()).parse([]);

    assertEquals(output, {
      _: [],
      nodeArgs: [],
      args: [undefined, [1]],
      unknownFlags: [],
      flags: {},
    });
  });

  test("define different data type for string default value", () => {
    class MakeModel extends BaseCommand {}
    MakeModel.defineArgument("name", {
      type: "string",
      default: null,
    });
    MakeModel.defineArgument("connections", {
      type: "spread",
      default: 1,
    });

    const output = new Parser(MakeModel.getParserOptions()).parse([]);

    assertEquals(output, {
      _: [],
      nodeArgs: [],
      args: [null, [1]],
      unknownFlags: [],
      flags: {},
    });
  });
});
