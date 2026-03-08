import type { ApmClawConfig } from "../../config/config.js";

export function makeModelFallbackCfg(overrides: Partial<ApmClawConfig> = {}): ApmClawConfig {
  return {
    agents: {
      defaults: {
        model: {
          primary: "openai/gpt-4.1-mini",
          fallbacks: ["anthropic/claude-haiku-3-5"],
        },
      },
    },
    ...overrides,
  } as ApmClawConfig;
}
