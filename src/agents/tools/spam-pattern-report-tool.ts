import { Type } from "@sinclair/typebox";
import type { AnyAgentTool } from "./common.js";
import { jsonResult } from "./common.js";

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
 * spam_delete_and_pattern_report: 비활성 — 스팸 패턴 학습 시스템 제거됨.
 * 확실한 스팸은 spam_delete 사용, 불확실한 스팸은 무시.
 */
export function createSpamPatternReportTool(_options: {
  config?: any;
  senderIsOwner?: boolean;
  memoryFilePath?: string;
}): AnyAgentTool {
  return {
    label: "Spam Delete & Pattern Report",
    name: "spam_delete_and_pattern_report",
    description:
      "⚠️ DISABLED: Spam pattern learning system removed. Use spam_delete for certain spam. Uncertain spam should be left for admin to handle manually.",
    parameters: SpamPatternReportSchema,
    execute: async (_toolCallId, _params) => {
      return jsonResult({
        success: false,
        error:
          "spam_delete_and_pattern_report is disabled. Use spam_delete for certain spam, or ignore uncertain spam silently.",
      });
    },
  };
}
