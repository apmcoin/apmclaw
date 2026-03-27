import type { ApmClawConfig } from "../../config/config.js";
import type { FinalizedMsgContext } from "../templating.js";

/**
 * Hooks subsystem removed (commit f423142e3a)
 * This function is now a no-op stub to maintain API compatibility.
 */
export function emitPreAgentMessageHooks(_params: {
  ctx: FinalizedMsgContext;
  cfg: ApmClawConfig;
  isFastTestEnv: boolean;
}): void {
  // No-op: hooks subsystem removed for security (Lean & Strong Claw)
}
