// Narrow plugin-sdk surface for the bundled diffs plugin.
// Keep this list additive and scoped to symbols used under extensions/diffs.

export type { ApmClawConfig } from "../config/config.js";
export { resolvePreferredApmClawTmpDir } from "../infra/tmp-openclaw-dir.js";
export type {
  AnyAgentTool,
  ApmClawPluginApi,
  ApmClawPluginConfigSchema,
  PluginLogger,
} from "../plugins/types.js";
