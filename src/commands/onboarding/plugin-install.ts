import type { OpenClawConfig } from "../../config/config.js";
import type { RuntimeEnv } from "../../runtime.js";

// Stub: plugin installation removed in apM Claw
export async function ensureOnboardingPluginInstalled(_params: {
  pluginName: string;
  prompter?: unknown;
  config: OpenClawConfig;
  runtime: RuntimeEnv;
  quiet?: boolean;
}): Promise<{ installed: boolean; updated: boolean }> {
  return { installed: false, updated: false };
}

export function reloadOnboardingPluginRegistry(_params: {
  cfg: OpenClawConfig;
  runtime: RuntimeEnv;
  workspaceDir?: string;
}): void {
  // Stub: plugin registry reload removed
}
