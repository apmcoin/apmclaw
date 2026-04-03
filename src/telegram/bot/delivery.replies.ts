import { type Bot, InputFile } from "grammy";
import { chunkMarkdownTextWithMode, type ChunkMode } from "../../auto-reply/chunk.js";
import type { ReplyPayload } from "../../auto-reply/types.js";
import type { ReplyToMode } from "../../config/config.js";
import type { MarkdownTableMode } from "../../config/types.base.js";
import { danger } from "../../globals.js";
import { formatErrorMessage } from "../../infra/errors.js";
import { buildOutboundMediaLoadOptions } from "../../media/load-options.js";
import { isGifMedia, kindFromMime } from "../../media/mime.js";
import type { RuntimeEnv } from "../../runtime.js";
import { loadWebMedia } from "../../web/media.js";
import type { TelegramInlineButtons } from "../button-types.js";
import { splitTelegramCaption } from "../caption.js";
import {
  markdownToTelegramChunks,
  markdownToTelegramHtml,
  renderTelegramHtmlText,
  wrapFileReferencesInHtml,
} from "../format.js";
import { buildInlineKeyboard } from "../send.js";
import {
  buildTelegramSendParams,
  sendTelegramText,
  sendTelegramWithThreadFallback,
} from "./delivery.send.js";
import { resolveTelegramReplyId, type TelegramThreadSpec } from "./helpers.js";

type DeliveryProgress = {
  hasReplied: boolean;
  hasDelivered: boolean;
  deliveredCount: number;
};

type TelegramReplyChannelData = {
  buttons?: TelegramInlineButtons;
  pin?: boolean;
};

type ChunkTextFn = (markdown: string) => ReturnType<typeof markdownToTelegramChunks>;

function buildChunkTextResolver(params: {
  textLimit: number;
  chunkMode: ChunkMode;
  tableMode?: MarkdownTableMode;
}): ChunkTextFn {
  return (markdown: string) => {
    const markdownChunks =
      params.chunkMode === "newline"
        ? chunkMarkdownTextWithMode(markdown, params.textLimit, params.chunkMode)
        : [markdown];
    const chunks: ReturnType<typeof markdownToTelegramChunks> = [];
    for (const chunk of markdownChunks) {
      const nested = markdownToTelegramChunks(chunk, params.textLimit, {
        tableMode: params.tableMode,
      });
      if (!nested.length && chunk) {
        chunks.push({
          html: wrapFileReferencesInHtml(
            markdownToTelegramHtml(chunk, { tableMode: params.tableMode, wrapFileRefs: false }),
          ),
          text: chunk,
        });
        continue;
      }
      chunks.push(...nested);
    }
    return chunks;
  };
}

function resolveReplyToForSend(params: {
  replyToId?: number;
  replyToMode: ReplyToMode;
  progress: DeliveryProgress;
}): number | undefined {
  return params.replyToId && (params.replyToMode === "all" || !params.progress.hasReplied)
    ? params.replyToId
    : undefined;
}

function markReplyApplied(progress: DeliveryProgress, replyToId?: number): void {
  if (replyToId && !progress.hasReplied) {
    progress.hasReplied = true;
  }
}

function markDelivered(progress: DeliveryProgress): void {
  progress.hasDelivered = true;
  progress.deliveredCount += 1;
}

async function deliverTextReply(params: {
  bot: Bot;
  chatId: string;
  runtime: RuntimeEnv;
  thread?: TelegramThreadSpec | null;
  chunkText: ChunkTextFn;
  replyText: string;
  replyMarkup?: ReturnType<typeof buildInlineKeyboard>;
  replyQuoteText?: string;
  linkPreview?: boolean;
  replyToId?: number;
  replyToMode: ReplyToMode;
  progress: DeliveryProgress;
}): Promise<number | undefined> {
  let firstDeliveredMessageId: number | undefined;
  const chunks = params.chunkText(params.replyText);
  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    if (!chunk) {
      continue;
    }
    const shouldAttachButtons = i === 0 && params.replyMarkup;
    const replyToForChunk = resolveReplyToForSend({
      replyToId: params.replyToId,
      replyToMode: params.replyToMode,
      progress: params.progress,
    });
    const messageId = await sendTelegramText(
      params.bot,
      params.chatId,
      chunk.html,
      params.runtime,
      {
        replyToMessageId: replyToForChunk,
        replyQuoteText: params.replyQuoteText,
        thread: params.thread,
        textMode: "html",
        plainText: chunk.text,
        linkPreview: params.linkPreview,
        replyMarkup: shouldAttachButtons ? params.replyMarkup : undefined,
      },
    );
    if (firstDeliveredMessageId == null) {
      firstDeliveredMessageId = messageId;
    }
    markReplyApplied(params.progress, replyToForChunk);
    markDelivered(params.progress);
  }
  return firstDeliveredMessageId;
}

async function sendPendingFollowUpText(params: {
  bot: Bot;
  chatId: string;
  runtime: RuntimeEnv;
  thread?: TelegramThreadSpec | null;
  chunkText: ChunkTextFn;
  text: string;
  replyMarkup?: ReturnType<typeof buildInlineKeyboard>;
  linkPreview?: boolean;
  replyToId?: number;
  replyToMode: ReplyToMode;
  progress: DeliveryProgress;
}): Promise<void> {
  const chunks = params.chunkText(params.text);
  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    const replyToForFollowUp = resolveReplyToForSend({
      replyToId: params.replyToId,
      replyToMode: params.replyToMode,
      progress: params.progress,
    });
    await sendTelegramText(params.bot, params.chatId, chunk.html, params.runtime, {
      replyToMessageId: replyToForFollowUp,
      thread: params.thread,
      textMode: "html",
      plainText: chunk.text,
      linkPreview: params.linkPreview,
      replyMarkup: i === 0 ? params.replyMarkup : undefined,
    });
    markReplyApplied(params.progress, replyToForFollowUp);
    markDelivered(params.progress);
  }
}

async function deliverMediaReply(params: {
  reply: ReplyPayload;
  mediaList: string[];
  bot: Bot;
  chatId: string;
  runtime: RuntimeEnv;
  thread?: TelegramThreadSpec | null;
  tableMode?: MarkdownTableMode;
  mediaLocalRoots?: readonly string[];
  chunkText: ChunkTextFn;
  linkPreview?: boolean;
  replyQuoteText?: string;
  replyMarkup?: ReturnType<typeof buildInlineKeyboard>;
  replyToId?: number;
  replyToMode: ReplyToMode;
  progress: DeliveryProgress;
}): Promise<number | undefined> {
  let firstDeliveredMessageId: number | undefined;
  let first = true;
  let pendingFollowUpText: string | undefined;
  for (const mediaUrl of params.mediaList) {
    const isFirstMedia = first;
    const media = await loadWebMedia(
      mediaUrl,
      buildOutboundMediaLoadOptions({ mediaLocalRoots: params.mediaLocalRoots }),
    );
    const kind = kindFromMime(media.contentType ?? undefined);
    const isGif = isGifMedia({
      contentType: media.contentType,
      fileName: media.fileName,
    });
    const fileName = media.fileName ?? (isGif ? "animation.gif" : "file");
    const file = new InputFile(media.buffer, fileName);
    const { caption, followUpText } = splitTelegramCaption(
      isFirstMedia ? (params.reply.text ?? undefined) : undefined,
    );
    const htmlCaption = caption
      ? renderTelegramHtmlText(caption, { tableMode: params.tableMode })
      : undefined;
    if (followUpText) {
      pendingFollowUpText = followUpText;
    }
    first = false;
    const replyToMessageId = resolveReplyToForSend({
      replyToId: params.replyToId,
      replyToMode: params.replyToMode,
      progress: params.progress,
    });
    const shouldAttachButtonsToMedia = isFirstMedia && params.replyMarkup && !followUpText;
    const mediaParams: Record<string, unknown> = {
      caption: htmlCaption,
      ...(htmlCaption ? { parse_mode: "HTML" } : {}),
      ...(shouldAttachButtonsToMedia ? { reply_markup: params.replyMarkup } : {}),
      ...buildTelegramSendParams({
        replyToMessageId,
        thread: params.thread,
      }),
    };
    if (isGif) {
      const result = await sendTelegramWithThreadFallback({
        operation: "sendAnimation",
        runtime: params.runtime,
        thread: params.thread,
        requestParams: mediaParams,
        send: (effectiveParams) =>
          params.bot.api.sendAnimation(params.chatId, file, { ...effectiveParams }),
      });
      if (firstDeliveredMessageId == null) {
        firstDeliveredMessageId = result.message_id;
      }
      markDelivered(params.progress);
    } else if (kind === "image") {
      const result = await sendTelegramWithThreadFallback({
        operation: "sendPhoto",
        runtime: params.runtime,
        thread: params.thread,
        requestParams: mediaParams,
        send: (effectiveParams) =>
          params.bot.api.sendPhoto(params.chatId, file, { ...effectiveParams }),
      });
      if (firstDeliveredMessageId == null) {
        firstDeliveredMessageId = result.message_id;
      }
      markDelivered(params.progress);
    } else if (kind === "video") {
      const result = await sendTelegramWithThreadFallback({
        operation: "sendVideo",
        runtime: params.runtime,
        thread: params.thread,
        requestParams: mediaParams,
        send: (effectiveParams) =>
          params.bot.api.sendVideo(params.chatId, file, { ...effectiveParams }),
      });
      if (firstDeliveredMessageId == null) {
        firstDeliveredMessageId = result.message_id;
      }
      markDelivered(params.progress);
    } else if (kind === "audio") {
      const result = await sendTelegramWithThreadFallback({
        operation: "sendAudio",
        runtime: params.runtime,
        thread: params.thread,
        requestParams: mediaParams,
        send: (effectiveParams) =>
          params.bot.api.sendAudio(params.chatId, file, { ...effectiveParams }),
      });
      if (firstDeliveredMessageId == null) {
        firstDeliveredMessageId = result.message_id;
      }
      markDelivered(params.progress);
    } else {
      const result = await sendTelegramWithThreadFallback({
        operation: "sendDocument",
        runtime: params.runtime,
        thread: params.thread,
        requestParams: mediaParams,
        send: (effectiveParams) =>
          params.bot.api.sendDocument(params.chatId, file, { ...effectiveParams }),
      });
      if (firstDeliveredMessageId == null) {
        firstDeliveredMessageId = result.message_id;
      }
      markDelivered(params.progress);
    }
    markReplyApplied(params.progress, replyToMessageId);
    if (pendingFollowUpText && isFirstMedia) {
      await sendPendingFollowUpText({
        bot: params.bot,
        chatId: params.chatId,
        runtime: params.runtime,
        thread: params.thread,
        chunkText: params.chunkText,
        text: pendingFollowUpText,
        replyMarkup: params.replyMarkup,
        linkPreview: params.linkPreview,
        replyToId: params.replyToId,
        replyToMode: params.replyToMode,
        progress: params.progress,
      });
      pendingFollowUpText = undefined;
    }
  }
  return firstDeliveredMessageId;
}

async function maybePinFirstDeliveredMessage(params: {
  shouldPin: boolean;
  bot: Bot;
  chatId: string;
  runtime: RuntimeEnv;
  firstDeliveredMessageId?: number;
}): Promise<void> {
  if (!params.shouldPin || typeof params.firstDeliveredMessageId !== "number") {
    return;
  }
  try {
    await params.bot.api.pinChatMessage(params.chatId, params.firstDeliveredMessageId, {
      disable_notification: true,
    });
  } catch (err) {
    // Fail silently but log diagnostics
  }
}

export async function deliverReplies(params: {
  replies: ReplyPayload[];
  chatId: string;
  accountId?: string;
  token: string;
  runtime: RuntimeEnv;
  bot: Bot;
  mediaLocalRoots?: readonly string[];
  replyToMode: ReplyToMode;
  textLimit: number;
  thread?: TelegramThreadSpec | null;
  tableMode?: MarkdownTableMode;
  chunkMode?: ChunkMode;
  /** Controls whether link previews are shown. Default: true (previews enabled). */
  linkPreview?: boolean;
  /** Optional quote text for Telegram reply_parameters. */
  replyQuoteText?: string;
}): Promise<{ delivered: boolean }> {
  const progress: DeliveryProgress = {
    hasReplied: false,
    hasDelivered: false,
    deliveredCount: 0,
  };
  // Hooks subsystem removed (commit f423142e3a)
  const chunkText = buildChunkTextResolver({
    textLimit: params.textLimit,
    chunkMode: params.chunkMode ?? "length",
    tableMode: params.tableMode,
  });
  for (const originalReply of params.replies) {
    let reply = originalReply;
    const mediaList = reply?.mediaUrls?.length
      ? reply.mediaUrls
      : reply?.mediaUrl
        ? [reply.mediaUrl]
        : [];
    const hasMedia = mediaList.length > 0;
    if (!reply?.text && !hasMedia) {
      params.runtime.error?.(danger("reply missing text/media"));
      continue;
    }

    try {
      const deliveredCountBeforeReply = progress.deliveredCount;
      const replyToId =
        params.replyToMode === "off" ? undefined : resolveTelegramReplyId(reply.replyToId);
      const telegramData = reply.channelData?.telegram as TelegramReplyChannelData | undefined;
      const shouldPinFirstMessage = telegramData?.pin === true;
      const replyMarkup = buildInlineKeyboard(telegramData?.buttons);
      let firstDeliveredMessageId: number | undefined;
      if (mediaList.length === 0) {
        firstDeliveredMessageId = await deliverTextReply({
          bot: params.bot,
          chatId: params.chatId,
          runtime: params.runtime,
          thread: params.thread,
          chunkText,
          replyText: reply.text || "",
          replyMarkup,
          replyQuoteText: params.replyQuoteText,
          linkPreview: params.linkPreview,
          replyToId,
          replyToMode: params.replyToMode,
          progress,
        });
      } else {
        firstDeliveredMessageId = await deliverMediaReply({
          reply,
          mediaList,
          bot: params.bot,
          chatId: params.chatId,
          runtime: params.runtime,
          thread: params.thread,
          tableMode: params.tableMode,
          mediaLocalRoots: params.mediaLocalRoots,
          chunkText,
          linkPreview: params.linkPreview,
          replyQuoteText: params.replyQuoteText,
          replyMarkup,
          replyToId,
          replyToMode: params.replyToMode,
          progress,
        });
      }
      await maybePinFirstDeliveredMessage({
        shouldPin: shouldPinFirstMessage,
        bot: params.bot,
        chatId: params.chatId,
        runtime: params.runtime,
        firstDeliveredMessageId,
      });
    } catch (error) {
      throw error;
    }
  }

  return { delivered: progress.hasDelivered };
}
