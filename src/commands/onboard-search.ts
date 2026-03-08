import type { OpenClawConfig } from "../config/config.js";
import type { WizardPrompter } from "../wizard/prompts.js";

export async function promptWebSearchConfig(
  config: OpenClawConfig,
  _prompter: WizardPrompter,
): Promise<{ config: OpenClawConfig }> {
  return { config };
}
