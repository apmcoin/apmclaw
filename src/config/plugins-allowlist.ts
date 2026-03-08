import type { ApmClawConfig } from "./config.js";

export function ensurePluginAllowlisted(cfg: ApmClawConfig, pluginId: string): ApmClawConfig {
  const allow = cfg.plugins?.allow;
  if (!Array.isArray(allow) || allow.includes(pluginId)) {
    return cfg;
  }
  return {
    ...cfg,
    plugins: {
      ...cfg.plugins,
      allow: [...allow, pluginId],
    },
  };
}
