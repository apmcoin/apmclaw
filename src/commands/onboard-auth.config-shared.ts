import type { OpenClawConfig } from "../config/config.js";

// Stub: onboard auth config removed in apM Claw
export function applyAgentDefaultModelPrimary(
  cfg: OpenClawConfig,
  _primary: string,
): OpenClawConfig {
  return cfg;
}
