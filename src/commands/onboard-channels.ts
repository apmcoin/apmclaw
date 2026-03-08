import type { OpenClawConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import type { WizardPrompter } from "./types.js";

export async function setupChannels(
  config: OpenClawConfig,
  _runtime: RuntimeEnv,
  _prompter: WizardPrompter,
  _options?: unknown,
): Promise<OpenClawConfig> {
  return config;
}

export function noteChannelStatus(_config: OpenClawConfig, _prompter: WizardPrompter): void {
}
