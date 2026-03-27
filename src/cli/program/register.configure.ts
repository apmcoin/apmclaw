import type { Command } from "commander";
// Onboarding removed (commit 65478e9a0f + c06d6f116a)
// import {
//   CONFIGURE_WIZARD_SECTIONS,
//   configureCommandFromSectionsArg,
// } from "../../commands/configure.js";
import { defaultRuntime } from "../../runtime.js";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { runCommandWithRuntime } from "../cli-utils.js";

export function registerConfigureCommand(program: Command) {
  // Onboarding removed: configure wizard deleted
  // PM-E uses direct config editing (apmclaw.json)
}
