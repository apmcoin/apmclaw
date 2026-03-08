import type { OpenClawConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import type { WizardPrompter } from "./types.js";

export async function setupSkills(
  config: OpenClawConfig,
  _runtime: RuntimeEnv,
  _prompter: WizardPrompter,
): Promise<OpenClawConfig> {
  return config;
}
