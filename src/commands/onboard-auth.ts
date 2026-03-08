import type { OpenClawConfig } from "../config/config.js";

export function applyAuthProfileConfig(
  cfg: OpenClawConfig,
  _profile?: unknown,
): OpenClawConfig {
  return cfg;
}

export function setAnthropicApiKey(_cfg: OpenClawConfig, _apiKey: unknown): void {
  // Stub
}

export function setOpenaiApiKey(_cfg: OpenClawConfig, _apiKey: unknown): void {
  // Stub
}

export function setByteplusApiKey(_cfg: OpenClawConfig, _apiKey: unknown): void {
  // Stub
}

export function setVolcengineApiKey(_cfg: OpenClawConfig, _apiKey: unknown): void {
  // Stub
}

export async function writeOAuthCredentials(_params: unknown): Promise<void> {
  // Stub
}
