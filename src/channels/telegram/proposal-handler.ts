import type { Bot } from "grammy";
import { moveMemorySection, extractProposalId } from "../../agents/tools/memory-helpers.js";
import { logVerbose } from "../../globals.js";

/**
 * Register Telegram handlers for Memory Proposal System
 * - Inline button for approval (silent)
 * - Reply for rejection (public learning)
 */
export function registerProposalHandlers(bot: Bot, workspaceDir?: string): void {
  // 1. [✅ Approve] button handler
  bot.on("callback_query", async (ctx) => {
    const callbackData = ctx.callbackQuery?.data;

    if (!callbackData?.startsWith("approve_")) {
      return; // Not a proposal approval
    }

    const proposalId = callbackData.split("_")[1];
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id;

    if (!chatId || !userId) {
      await ctx.answerCallbackQuery({ text: "❌ Error: Missing chat or user info" });
      return;
    }

    try {
      // Admin verification (CODE LEVEL - cannot be bypassed by prompts)
      const member = await ctx.api.getChatMember(chatId, userId);
      const isAdmin = ["administrator", "creator"].includes(member.status);

      if (!isAdmin) {
        await ctx.answerCallbackQuery({
          text: "❌ Admins only",
          show_alert: true,
        });
        return;
      }

      // Move from Pending → Approved
      await moveMemorySection(
        proposalId,
        "Pending",
        "Approved",
        {
          approvedBy: ctx.from.username || String(userId),
          approvedAt: new Date().toISOString(),
        },
        workspaceDir,
      );

      // Update message (remove button + show approval)
      const originalText = ctx.callbackQuery.message?.text || "";
      const updatedText = `✅ Approved by @${ctx.from.username || userId}\n\n${originalText}`;

      await ctx.editMessageText(updatedText, { reply_markup: undefined });
      await ctx.answerCallbackQuery({ text: "✅ Approved" });

      logVerbose(`[telegram] Proposal ${proposalId} approved by ${ctx.from.username || userId}`);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logVerbose(`[telegram] Failed to approve proposal ${proposalId}: ${error}`);
      await ctx.answerCallbackQuery({ text: `❌ Error: ${error}`, show_alert: true });
    }
  });

  // 2. Reply handler for rejection
  bot.on("message:text", async (ctx) => {
    const replyTo = ctx.message.reply_to_message;

    if (!replyTo?.text?.includes("[PM-E Proposal]")) {
      return; // Not replying to a proposal
    }

    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;

    if (!userId || !chatId) {
      return; // Missing info
    }

    try {
      // Admin verification (CODE LEVEL)
      const member = await ctx.api.getChatMember(chatId, userId);
      const isAdmin = ["administrator", "creator"].includes(member.status);

      if (!isAdmin) {
        return; // Silently ignore non-admin replies
      }

      // Extract proposal ID from replied message
      const proposalId = extractProposalId(replyTo.text);
      if (!proposalId) {
        await ctx.reply("❌ Could not find proposal ID in the message.");
        return;
      }

      // Move from Pending → Rejected (with reason)
      await moveMemorySection(
        proposalId,
        "Pending",
        "Rejected",
        {
          rejectedBy: ctx.from.username || String(userId),
          rejectedAt: new Date().toISOString(),
          reason: ctx.message.text,
        },
        workspaceDir,
      );

      await ctx.reply(
        `✅ Rejection recorded. Thank you, @${ctx.from.username || userId}!\n\nThis helps me learn what's not spam.`,
        { reply_parameters: { message_id: ctx.message.message_id } },
      );

      logVerbose(`[telegram] Proposal ${proposalId} rejected by ${ctx.from.username || userId}`);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      logVerbose(`[telegram] Failed to reject proposal: ${error}`);
      await ctx.reply(`❌ Error processing rejection: ${error}`);
    }
  });
}
