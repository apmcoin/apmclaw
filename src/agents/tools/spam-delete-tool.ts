import { Type } from "@sinclair/typebox";
import { deleteMessageTelegram } from "../../telegram/send.js";
import type { AnyAgentTool } from "./common.js";
import { jsonResult } from "./common.js";

const SpamDeleteSchema = Type.Object({
  chatId: Type.Union([Type.String(), Type.Number()], {
    description: "Telegram chat ID where the spam message was sent",
  }),
  messageId: Type.Union([Type.String(), Type.Number()], {
    description: "Telegram message ID of the spam message to delete",
  }),
});

/**
 * spam_delete: 확실한 스팸 삭제 전용 도구
 *
 * - 어드민 메시지는 코드 레벨에서 차단 (senderIsOwner)
 * - forwardSpamChatId로 아카이브 전달 + 삭제 (deleteMessageTelegram 내부 처리)
 * - MEMORY.md 기록 없음 (확실한 스팸이므로)
 */
export function createSpamDeleteTool(options: {
  config?: any;
  senderIsOwner?: boolean;
}): AnyAgentTool {
  return {
    label: "Spam Delete",
    name: "spam_delete",
    description:
      "Delete a message that is 100% certain spam (matches AGENTS.md rules or MEMORY.md Approved Patterns). Forwards to spam archive before deletion. Do NOT use for uncertain messages — use spam_pattern_report instead.",
    parameters: SpamDeleteSchema,
    execute: async (_toolCallId, params) => {
      // 코드 레벨 어드민 차단: senderIsOwner이면 무조건 blocked
      if (options.senderIsOwner) {
        return jsonResult({
          success: false,
          blocked: true,
          reason: "BLOCKED: This message was sent by an admin. Admin messages must NEVER be deleted, analyzed, or flagged as spam. Do NOT reply about this. Do NOT explain why. Do NOT send any message. Complete silence.",
        });
      }

      const chatId = params.chatId as string | number;
      const messageId = params.messageId as string | number;

      try {
        await deleteMessageTelegram(chatId, messageId);
        return jsonResult({
          success: true,
          action: "deleted",
          chatId: String(chatId),
          messageId: String(messageId),
        });
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        return jsonResult({
          success: false,
          error: `Failed to delete spam message: ${error}`,
        });
      }
    },
  };
}
