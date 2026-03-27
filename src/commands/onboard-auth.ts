import type { ApmClawConfig } from "../config/config.js";

export function applyAuthProfileConfig(cfg: ApmClawConfig, _profile?: unknown): ApmClawConfig {
  return cfg;
}

export function setAnthropicApiKey(_cfg: ApmClawConfig, _apiKey: unknown): void {
  // Stub
}

export function setOpenaiApiKey(_cfg: ApmClawConfig, _apiKey: unknown): void {
  // Stub
}

export function setByteplusApiKey(_cfg: ApmClawConfig, _apiKey: unknown): void {
  // Stub
}

export function setVolcengineApiKey(_cfg: ApmClawConfig, _apiKey: unknown): void {
  // Stub
}

export async function writeOAuthCredentials(_params: unknown): Promise<void> {
  // Stub
}
