import type { ApmClawConfig } from "../config/config.js";
import type { WizardPrompter } from "./types.js";

export async function promptCustomApiConfig(_params: {
  prompter: WizardPrompter;
  runtime: unknown;
  config: ApmClawConfig;
}): Promise<{ config: ApmClawConfig }> {
  return { config: _params.config };
}
