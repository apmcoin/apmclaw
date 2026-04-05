// Stub: commands/ 제거 시 함께 삭제
import type { OutboundSendDeps } from "../infra/outbound/deliver.js";
import type { sendMessageTelegram } from "../telegram/send.js";

export type CliDeps = {
  sendMessageTelegram: typeof sendMessageTelegram;
};

export function createOutboundSendDeps(deps: CliDeps): OutboundSendDeps {
  return {
    sendTelegram: deps.sendMessageTelegram,
  };
}
