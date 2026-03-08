import type { ApmClawConfig } from "../config/config.js";
import type { WizardPrompter } from "./types.js";

export async function promptWebSearchConfig(
  config: ApmClawConfig,
  _prompter: WizardPrompter,
): Promise<{ config: ApmClawConfig }> {
  return { config };
}
