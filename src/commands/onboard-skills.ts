import type { ApmClawConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import type { WizardPrompter } from "./types.js";

export async function setupSkills(
  config: ApmClawConfig,
  _runtime: RuntimeEnv,
  _prompter: WizardPrompter,
): Promise<ApmClawConfig> {
  return config;
}
