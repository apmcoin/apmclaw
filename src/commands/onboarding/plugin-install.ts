import type { ApmClawConfig } from "../../config/config.js";
import type { RuntimeEnv } from "../../runtime.js";

export async function ensureOnboardingPluginInstalled(_params: {
  pluginName: string;
  prompter?: unknown;
  config: ApmClawConfig;
  runtime: RuntimeEnv;
  quiet?: boolean;
}): Promise<{ installed: boolean; updated: boolean }> {
  return { installed: false, updated: false };
}

export function reloadOnboardingPluginRegistry(_params: {
  cfg: ApmClawConfig;
  runtime: RuntimeEnv;
  workspaceDir?: string;
}): void {}
