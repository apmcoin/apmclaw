// Node-host removed (device control deleted) - inline timeout helper
const withTimeout = async <T>(fn: () => Promise<T>, timeoutMs: number, label: string): Promise<T> => {
  return await Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
};

export const EMBEDDED_COMPACTION_TIMEOUT_MS = 300_000;

export async function compactWithSafetyTimeout<T>(
  compact: () => Promise<T>,
  timeoutMs: number = EMBEDDED_COMPACTION_TIMEOUT_MS,
): Promise<T> {
  return await withTimeout(() => compact(), timeoutMs, "Compaction");
}
