import type { OpenClawConfig } from "../config/config.js";
import type { WizardPrompter } from "../wizard/prompts.js";

// Stub: web search configuration removed in apM Claw
export async function promptWebSearchConfig(
  config: OpenClawConfig,
  _prompter: WizardPrompter,
): Promise<{ config: OpenClawConfig }> {
  return { config };
}
