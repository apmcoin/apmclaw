import type { OutboundSendDeps } from "../infra/outbound/deliver.js";
// Signal removed (Telegram-only)
import type { sendMessageTelegram } from "../telegram/send.js";
import { createOutboundSendDepsFromCliSource } from "./outbound-send-mapping.js";

export type CliDeps = {
  sendMessageTelegram: typeof sendMessageTelegram;
  // Signal removed (Telegram-only)
};

let telegramSenderRuntimePromise: Promise<typeof import("./deps-send-telegram.runtime.js")> | null =
  null;

function loadTelegramSenderRuntime() {
  telegramSenderRuntimePromise ??= import("./deps-send-telegram.runtime.js");
  return telegramSenderRuntimePromise;
}

// Signal loader removed (Telegram-only)

export function createDefaultDeps(): CliDeps {
  return {
    sendMessageTelegram: async (...args) => {
      const { sendMessageTelegram } = await loadTelegramSenderRuntime();
      return await sendMessageTelegram(...args);
    },
    // Signal removed (Telegram-only)
  };
}

export function createOutboundSendDeps(deps: CliDeps): OutboundSendDeps {
  return createOutboundSendDepsFromCliSource(deps);
}
