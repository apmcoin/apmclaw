export type DirectiveTags = {
  replyToId?: string;
  replyToCurrent: boolean;
};

const REPLY_TO_RE = /\[\[\s*reply_to\s*:\s*([^\]]+)\s*\]\]/gi;
const REPLY_CURRENT_RE = /\[\[\s*reply_to_current\s*\]\]/gi;

export function extractDirectiveTags(text: string): {
  cleanText: string;
  tags: DirectiveTags;
} {
  let cleanText = text;
  let replyToId: string | undefined;
  let replyToCurrent = false;

  cleanText = cleanText.replace(REPLY_TO_RE, (_, id) => {
    replyToId = id.trim();
    return "";
  });

  cleanText = cleanText.replace(REPLY_CURRENT_RE, () => {
    replyToCurrent = true;
    return "";
  });

  return {
    cleanText: cleanText.trim(),
    tags: {
      replyToId,
      replyToCurrent,
    },
  };
}

export function stripInlineDirectiveTagsForDisplay(text: string): { text: string; changed: boolean } {
  const clean = text.replace(REPLY_TO_RE, "").replace(REPLY_CURRENT_RE, "");
  return {
    text: clean,
    changed: clean !== text,
  };
}

export function stripInlineDirectiveTagsFromMessageForDisplay<T extends { content?: any }>(
  message: T,
): T {
  if (typeof message === "string") {
    return stripInlineDirectiveTagsForDisplay(message).text as any;
  }
  if (!message || typeof message !== "object") {
    return message;
  }
  const content = message.content;
  if (typeof content === "string") {
    return { ...message, content: stripInlineDirectiveTagsForDisplay(content).text };
  }
  if (Array.isArray(content)) {
    return {
      ...message,
      content: content.map((part) => {
        if (typeof part === "object" && part !== null && "text" in part && typeof part.text === "string") {
          return { ...part, text: stripInlineDirectiveTagsForDisplay(part.text).text };
        }
        return part;
      }),
    };
  }
  return message;
}
