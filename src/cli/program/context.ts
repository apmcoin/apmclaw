import { VERSION } from "../../version.js";

export type ProgramContext = {
  programVersion: string;
  channelOptions: string[];
  messageChannelOptions: string;
  agentChannelOptions: string;
};

// Telegram 전용 — 채널 옵션 하드코딩
export function createProgramContext(): ProgramContext {
  const channelOptions = ["telegram"];
  return {
    programVersion: VERSION,
    channelOptions,
    get messageChannelOptions() {
      return channelOptions.join("|");
    },
    get agentChannelOptions() {
      return ["last", ...channelOptions].join("|");
    },
  };
}
