import fs from "node:fs/promises";
import path from "node:path";
import { Type } from "@sinclair/typebox";
import { deleteMessageTelegram, sendMessageTelegram } from "../../telegram/send.js";
import { MEMORY_MD_TEMPLATE, ensureMemoryMdSections } from "./memory-helpers.js";
import type { AnyAgentTool } from "./common.js";
import { jsonResult, readStringParam } from "./common.js";

const SpamPatternReportSchema = Type.Object({
  chatId: Type.Union([Type.String(), Type.Number()], {
    description: "Telegram chat ID where the spam message was sent",
  }),
  messageId: Type.Union([Type.String(), Type.Number()], {
    description: "Telegram message ID of the spam message",
  }),
  messageText: Type.String({
    description: "Original message text (for admin notification blockquote)",
  }),
  reasoning: Type.String({
    description: "Why this was judged as spam (reference AGENTS.md patterns, mention red flags)",
  }),
});

/**
 * spam_delete_and_pattern_report: 불확실한 스팸 삭제 + 패턴 학습 문의 도구
 *
 * 원자적 처리: 삭제 → MEMORY.md 기록 → 어드민 알림 전송
 * - 어드민 메시지는 코드 레벨에서 차단 (senderIsOwner)
 * - 어드민 알림은 원래 채팅에 전송 (승인 버튼 + 거부 안내)
 * - proposal-handler.ts와 호환 유지 ([PM-E Proposal], ID: PENDING-xxx)
 */
export function createSpamPatternReportTool(options: {
  config?: any;
  senderIsOwner?: boolean;
  memoryFilePath?: string;
}): AnyAgentTool {
  return {
    label: "Spam Delete & Pattern Report",
    name: "spam_delete_and_pattern_report",
    description:
      "⚠️ DISABLED: Under redesign. Use spam_delete for certain spam. Uncertain spam should be left for admin to handle manually.",
    parameters: SpamPatternReportSchema,
    execute: async (_toolCallId, _params) => {
      return jsonResult({
        success: false,
        error:
          "spam_delete_and_pattern_report is temporarily disabled. Use spam_delete for certain spam, or ignore uncertain spam silently.",
      });

      /* ORIGINAL CODE (disabled):
      // 코드 레벨 어드민 차단
      if (options.senderIsOwner) {
        return jsonResult({
          success: false,
          blocked: true,
          reason: "BLOCKED: This message was sent by an admin. Admin messages must NEVER be deleted, analyzed, or flagged as spam. Do NOT reply about this. Do NOT explain why. Do NOT send any message. Complete silence.",
        });
      }

      const chatId = params.chatId as string | number;
      const messageId = params.messageId as string | number;
      const messageText = readStringParam(params, "messageText", { required: true });
      const reasoning = readStringParam(params, "reasoning", { required: true });

      // Step 1: 메시지 삭제 (아카이브 전달 + 삭제)
      try {
        await deleteMessageTelegram(chatId, messageId);
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        return jsonResult({
          success: false,
          error: `Failed to delete message: ${error}`,
        });
      }

      // Step 2: MEMORY.md에 Pending Proposal 기록
      const proposalId = `PENDING-${Date.now()}`;
      const timestamp = new Date().toISOString().split(".")[0].replace("T", " ");

      const proposal = `
### [${proposalId}] Spam Pattern Report
Proposed: ${timestamp}
Message: chatId=${chatId} messageId=${messageId}
Action Taken: deleted
Reasoning: ${reasoning}
Evidence:
1. ${messageText}
Status: Awaiting admin review

`;

      if (options.memoryFilePath) {
        try {
          let content = "";
          try {
            content = await fs.readFile(options.memoryFilePath, "utf-8");
          } catch {
            // 파일 없으면 자동 생성
            content = MEMORY_MD_TEMPLATE;
            await fs.mkdir(path.dirname(options.memoryFilePath), { recursive: true });
            await fs.writeFile(options.memoryFilePath, content, "utf-8");
          }

          // 섹션 구조 검증 및 보정
          content = ensureMemoryMdSections(content);

          // Pending Proposals 섹션에 삽입
          const pendingSection = "## 3. Pending Proposals";
          const pendingSectionIndex = content.indexOf(pendingSection);

          if (pendingSectionIndex !== -1) {
            const nextSectionRegex = /\n## \d+\./g;
            nextSectionRegex.lastIndex = pendingSectionIndex + pendingSection.length;
            const match = nextSectionRegex.exec(content);
            const insertPosition = match ? match.index : content.length;

            const beforeInsert = content.substring(0, insertPosition);
            const afterInsert = content.substring(insertPosition);
            const cleanedBefore = beforeInsert.replace(/\n_No pending proposals\._\s*$/m, "\n");

            const updatedContent = cleanedBefore + proposal + afterInsert;
            await fs.writeFile(options.memoryFilePath, updatedContent, "utf-8");
          }
        } catch (err) {
          // MEMORY.md 기록 실패해도 삭제는 이미 완료 — 계속 진행
        }
      }

      // Step 3: 원래 채팅에 어드민 알림 전송
      const truncatedText =
        messageText.length > 500 ? messageText.substring(0, 500) + "..." : messageText;

      // HTML 이스케이프
      const escapedText = truncatedText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const escapedReasoning = reasoning
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      const notificationText =
        `[PM-E Proposal] Spam Pattern Report\n` +
        `ID: ${proposalId}\n\n` +
        `<blockquote>${escapedText}</blockquote>\n\n` +
        `Reasoning: ${escapedReasoning}\n\n` +
        `To reject: reply to this message with the reason.`;

      try {
        await sendMessageTelegram(String(chatId), notificationText, {
          textMode: "html",
          buttons: [[{ text: "Approve", callback_data: `approve_${proposalId}` }]],
        });
      } catch (err) {
        // 알림 전송 실패해도 삭제+기록은 이미 완료
      }

      return jsonResult({
        success: true,
        proposalId,
        action: "deleted_and_reported",
        chatId: String(chatId),
        messageId: String(messageId),
      });
      */
    },
  };
}
