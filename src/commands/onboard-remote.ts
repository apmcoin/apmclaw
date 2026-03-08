import type { OpenClawConfig } from "../config/config.js";
import type { WizardPrompter } from "../wizard/prompts.js";

// Stub: remote gateway configuration removed in apM Claw
export async function promptRemoteGatewayConfig(
  config: OpenClawConfig,
  _prompter: WizardPrompter,
): Promise<OpenClawConfig> {
  return config;
}
