import type { ApmClawConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import type { WizardPrompter } from "./types.js";

export async function setupChannels(
  config: ApmClawConfig,
  _runtime: RuntimeEnv,
  _prompter: WizardPrompter,
  _options?: unknown,
): Promise<ApmClawConfig> {
  return config;
}

export function noteChannelStatus(_config: ApmClawConfig, _prompter: WizardPrompter): void {}
