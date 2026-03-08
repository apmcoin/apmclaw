export const DEFAULT_ZAI_ENDPOINT_DETECTION_TIMEOUT_MS = 15000;

export function detectZaiEndpoint(_baseUrl: string, _timeoutMs?: number): Promise<unknown> {
  return Promise.resolve({ detected: false });
}
