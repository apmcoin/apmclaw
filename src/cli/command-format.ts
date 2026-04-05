// CLI 커맨드 포맷팅 — 에러 메시지 등에서 사용
// (cli-name.ts, profile-utils.ts 인라인)

const CLI_PREFIX_RE = /^(?:pnpm|npm|bunx|npx)\s+openclaw\b|^openclaw\b/;
const PROFILE_FLAG_RE = /(?:^|\s)--profile(?:\s|=|$)/;
const DEV_FLAG_RE = /(?:^|\s)--dev(?:\s|$)/;
const PROFILE_NAME_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

function normalizeProfileName(raw?: string | null): string | null {
  const profile = raw?.trim();
  if (!profile || profile.toLowerCase() === "default" || !PROFILE_NAME_RE.test(profile)) {
    return null;
  }
  return profile;
}

export function formatCliCommand(
  command: string,
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): string {
  // 단순화: CLI 이름 교체 생략 (항상 "apmclaw")
  const profile = normalizeProfileName(env.APMCLAW_PROFILE);
  if (!profile) {
    return command;
  }
  if (!CLI_PREFIX_RE.test(command)) {
    return command;
  }
  if (PROFILE_FLAG_RE.test(command) || DEV_FLAG_RE.test(command)) {
    return command;
  }
  return command.replace(CLI_PREFIX_RE, (match) => `${match} --profile ${profile}`);
}
