import type { OutboundSendDeps } from "../infra/outbound/deliver.js";

export type CliOutboundSendSource = {
  sendMessageTelegram: OutboundSendDeps["sendTelegram"];
  sendMessageSignal: OutboundSendDeps["sendSignal"];
};

// Provider docking: extend this mapping when adding new outbound send deps.
export function createOutboundSendDepsFromCliSource(deps: CliOutboundSendSource): OutboundSendDeps {
  return {
    sendTelegram: deps.sendMessageTelegram,
    sendSignal: deps.sendMessageSignal,
  };
}
