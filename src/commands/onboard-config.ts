import type { OpenClawConfig } from "../config/config.js";

// Stub: onboard config removed in apM Claw
export function applyOnboardingLocalWorkspaceConfig(
  cfg: OpenClawConfig,
  _workspaceDir?: string,
): OpenClawConfig {
  return cfg;
}
