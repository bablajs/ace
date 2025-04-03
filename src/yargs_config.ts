import { Configuration } from "yargs-parser";

/**
 * The fixed config used to parse command line arguments using yargs. We
 * do not allow changing these options, since some of the internal
 * checks and features rely on this specific config
 */
export const yargsConfig: Partial<Configuration> = {
  "camel-case-expansion": false,
  "combine-arrays": true,
  "short-option-groups": true,
  "dot-notation": false,
  "parse-numbers": true,
  "parse-positional-numbers": false,
  "boolean-negation": true,
  "flatten-duplicate-arrays": true,
  "greedy-arrays": false,
  "strip-aliased": true,
  "nargs-eats-options": false,
  "unknown-options-as-args": false,
};
