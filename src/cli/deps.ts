// CLI 의존성 — Telegram 전용 (outbound-send-mapping 인라인)
import type { OutboundSendDeps } from "../infra/outbound/deliver.js";
import type { sendMessageTelegram } from "../telegram/send.js";

export type CliDeps = {
  sendMessageTelegram: typeof sendMessageTelegram;
};

let telegramSenderRuntimePromise: Promise<typeof import("../telegram/send.js")> | null = null;

export function createDefaultDeps(): CliDeps {
  return {
    sendMessageTelegram: async (...args) => {
      telegramSenderRuntimePromise ??= import("../telegram/send.js");
      const mod = await telegramSenderRuntimePromise;
      return await mod.sendMessageTelegram(...args);
    },
  };
}

export function createOutboundSendDeps(deps: CliDeps): OutboundSendDeps {
  return {
    sendTelegram: deps.sendMessageTelegram,
  };
}
