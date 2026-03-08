import type { ApmClawConfig } from "../config/config.js";

export function applyOnboardingLocalWorkspaceConfig(
  cfg: ApmClawConfig,
  _workspaceDir?: string,
): ApmClawConfig {
  return cfg;
}
