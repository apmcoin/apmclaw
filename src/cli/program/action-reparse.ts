import type { Command } from "commander";
import { buildParseArgv } from "../argv.js";

// helpers.ts에서 인라인
function resolveActionArgs(actionCommand?: Command): string[] {
  if (!actionCommand) {
    return [];
  }
  const args = (actionCommand as Command & { args?: string[] }).args;
  return Array.isArray(args) ? args : [];
}

export async function reparseProgramFromActionArgs(
  program: Command,
  actionArgs: unknown[],
): Promise<void> {
  const actionCommand = actionArgs.at(-1) as Command | undefined;
  const root = actionCommand?.parent ?? program;
  const rawArgs = (root as Command & { rawArgs?: string[] }).rawArgs;
  const actionArgsList = resolveActionArgs(actionCommand);
  const fallbackArgv = actionCommand?.name()
    ? [actionCommand.name(), ...actionArgsList]
    : actionArgsList;
  const parseArgv = buildParseArgv({
    programName: program.name(),
    rawArgs,
    fallbackArgv,
  });
  await program.parseAsync(parseArgv);
}
