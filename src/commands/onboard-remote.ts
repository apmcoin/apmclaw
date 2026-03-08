import type { ApmClawConfig } from "../config/config.js";
import type { WizardPrompter } from "./types.js";

export async function promptRemoteGatewayConfig(
  config: ApmClawConfig,
  _prompter: WizardPrompter,
): Promise<ApmClawConfig> {
  return config;
}
