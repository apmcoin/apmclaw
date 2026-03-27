import type { ReplyPayload } from "../types.js";

export const UNSCHEDULED_REMINDER_NOTE =
  "Note: I did not schedule a reminder in this turn, so this will not trigger automatically.";

const REMINDER_COMMITMENT_PATTERNS: RegExp[] = [
  /\b(?:i\s*['']?ll|i will)\s+(?:make sure to\s+)?(?:remember|remind|ping|follow up|follow-up|check back|circle back)\b/i,
  /\b(?:i\s*['']?ll|i will)\s+(?:set|create|schedule)\s+(?:a\s+)?reminder\b/i,
];

export function hasUnbackedReminderCommitment(text: string): boolean {
  const normalized = text.toLowerCase();
  if (!normalized.trim()) {
    return false;
  }
  if (normalized.includes(UNSCHEDULED_REMINDER_NOTE.toLowerCase())) {
    return false;
  }
  return REMINDER_COMMITMENT_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Returns false as cron functionality has been removed.
 * Previously checked if the cron store had session-related jobs.
 */
export async function hasSessionRelatedCronJobs(params: {
  cronStorePath?: string;
  sessionKey?: string;
}): Promise<boolean> {
  return false;
}

export function appendUnscheduledReminderNote(payloads: ReplyPayload[]): ReplyPayload[] {
  let appended = false;
  return payloads.map((payload) => {
    if (appended || payload.isError || typeof payload.text !== "string") {
      return payload;
    }
    if (!hasUnbackedReminderCommitment(payload.text)) {
      return payload;
    }
    appended = true;
    const trimmed = payload.text.trimEnd();
    return {
      ...payload,
      text: `${trimmed}\n\n${UNSCHEDULED_REMINDER_NOTE}`,
    };
  });
}
