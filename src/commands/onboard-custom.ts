import type { OpenClawConfig } from "../config/config.js";
import type { WizardPrompter } from "../wizard/prompts.js";

export async function promptCustomApiConfig(_params: {
  prompter: WizardPrompter;
  runtime: unknown;
  config: OpenClawConfig;
}): Promise<{ config: OpenClawConfig }> {
  return { config: _params.config };
}
