import type { Command } from "commander";
import { setVerbose } from "../../globals.js";
import { getVerboseFlag, hasHelpOrVersion } from "../argv.js";

// OpenClaw 레거시 (banner, config-guard, plugin-registry) 제거
// gateway 커맨드만 남아서 단순한 pre-action hook만 유지

export function registerPreActionHooks(program: Command, _programVersion: string) {
  program.hook("preAction", async (_thisCommand, actionCommand) => {
    // 프로세스 타이틀 설정
    let current: Command = actionCommand;
    while (current.parent && current.parent.parent) {
      current = current.parent;
    }
    const name = current.name();
    if (name) {
      process.title = `apmclaw-${name}`;
    }

    const argv = process.argv;
    if (hasHelpOrVersion(argv)) {
      return;
    }

    const verbose = getVerboseFlag(argv, { includeDebug: true });
    setVerbose(verbose);
    if (!verbose) {
      process.env.NODE_NO_WARNINGS ??= "1";
    }
  });
}
