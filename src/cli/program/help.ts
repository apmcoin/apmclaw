import type { Command } from "commander";
import { theme } from "../../terminal/theme.js";
import { hasFlag, hasRootVersionAlias } from "../argv.js";
import type { ProgramContext } from "./context.js";

// OpenClaw 레거시 help 커스터마이징 대폭 단순화

export function configureProgramHelp(program: Command, ctx: ProgramContext) {
  program
    .name("apmclaw")
    .description("apM Claw — Telegram 커뮤니티 관리 봇")
    .version(ctx.programVersion);

  program.option("--no-color", "Disable ANSI colors", false);
  program.helpOption("-h, --help", "Display help for command");
  program.helpCommand("help [command]", "Display help for command");

  program.configureHelp({
    sortSubcommands: true,
    sortOptions: true,
    optionTerm: (option) => theme.option(option.flags),
    subcommandTerm: (cmd) => theme.command(cmd.name()),
  });

  program.configureOutput({
    writeOut: (str) => process.stdout.write(str),
    writeErr: (str) => process.stderr.write(str),
    outputError: (str, write) => write(theme.error(str)),
  });

  if (
    hasFlag(process.argv, "-V") ||
    hasFlag(process.argv, "--version") ||
    hasRootVersionAlias(process.argv)
  ) {
    console.log(ctx.programVersion);
    process.exit(0);
  }
}
