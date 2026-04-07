/**
 * proposal-handler.ts
 *
 * 이전 스팸 패턴 제안 승인/거부 핸들러 제거됨.
 * MEMORY.md는 순수 프로젝트 위키로만 사용.
 * 향후 메모리 시스템 재설계 시 이 파일 재활용 가능.
 */

import type { Bot } from "grammy";

// 빈 핸들러 — 기존 호출부 호환용
export function registerProposalHandlers(_bot: Bot, _workspaceDir?: string): void {
  // 스팸 제안 시스템 제거됨 — no-op
}
