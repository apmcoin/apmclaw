import type { OutboundSendDeps } from "../infra/outbound/deliver.js";
import type { sendMessageSignal } from "../signal/send.js";
import type { sendMessageTelegram } from "../telegram/send.js";
import { createOutboundSendDepsFromCliSource } from "./outbound-send-mapping.js";

export type CliDeps = {
  sendMessageTelegram: typeof sendMessageTelegram;
  sendMessageSignal: typeof sendMessageSignal;
};

let telegramSenderRuntimePromise: Promise<typeof import("./deps-send-telegram.runtime.js")> | null =
  null;
let signalSenderRuntimePromise: Promise<typeof import("./deps-send-signal.runtime.js")> | null =
  null;

function loadTelegramSenderRuntime() {
  telegramSenderRuntimePromise ??= import("./deps-send-telegram.runtime.js");
  return telegramSenderRuntimePromise;
}

function loadSignalSenderRuntime() {
  signalSenderRuntimePromise ??= import("./deps-send-signal.runtime.js");
  return signalSenderRuntimePromise;
}

export function createDefaultDeps(): CliDeps {
  return {
    sendMessageTelegram: async (...args) => {
      const { sendMessageTelegram } = await loadTelegramSenderRuntime();
      return await sendMessageTelegram(...args);
    },
    sendMessageSignal: async (...args) => {
      const { sendMessageSignal } = await loadSignalSenderRuntime();
      return await sendMessageSignal(...args);
    },
  };
}

export function createOutboundSendDeps(deps: CliDeps): OutboundSendDeps {
  return createOutboundSendDepsFromCliSource(deps);
}
