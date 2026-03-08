import type { OpenClawConfig } from "../config/config.js";
import type { WizardPrompter } from "./types.js";

export async function promptRemoteGatewayConfig(
  config: OpenClawConfig,
  _prompter: WizardPrompter,
): Promise<OpenClawConfig> {
  return config;
}
