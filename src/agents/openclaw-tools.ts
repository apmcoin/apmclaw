import type { ApmClawConfig } from "../config/config.js";
import { resolvePluginTools } from "../plugins/tools.js";
import type { GatewayMessageChannel } from "../utils/message-channel.js";
import { resolveSessionAgentId } from "./agent-scope.js";
import type { SandboxFsBridge } from "./sandbox/fs-bridge.js";
import type { ToolFsPolicy } from "./tool-fs-policy.js";
// Removed: Lean Strong Claw - unused tools
// import { createAgentsListTool } from "./tools/agents-list-tool.js";
import type { AnyAgentTool } from "./tools/common.js";
import { createMemoryProposeTool } from "./tools/memory-propose-tool.js";
import { createMemorySaveTool } from "./tools/memory-save-tool.js";
import { createMemorySearchTool, createMemoryGetTool } from "./tools/memory-tool.js";
// Removed: Lean Strong Claw - unused tools
// import { createCronTool } from "./tools/cron-tool.js";
// import { createImageTool } from "./tools/image-tool.js";
import { createMessageTool } from "./tools/message-tool.js";
import { createPdfTool } from "./tools/pdf-tool.js";
// Removed: Lean Strong Claw - unused tools
// import { createSessionStatusTool } from "./tools/session-status-tool.js";
// import { createSessionsHistoryTool } from "./tools/sessions-history-tool.js";
// import { createSessionsListTool } from "./tools/sessions-list-tool.js";
// import { createSessionsSendTool } from "./tools/sessions-send-tool.js";
// Removed: Subagents tool dependency
// import { createSessionsSpawnTool } from "./tools/sessions-spawn-tool.js";
import { createWebFetchTool, createWebSearchTool } from "./tools/web-tools.js";
import { resolveWorkspaceRoot } from "./workspace-dir.js";

/**
 * PM-E Tool Registry (apM Claw Engine)
 * Refined for "Lean & Strong" security. Removed browser, subagents, and gateway.
 */
export function createApmClawTools(options?: {
  agentSessionKey?: string;
  agentChannel?: GatewayMessageChannel;
  agentAccountId?: string;
  agentTo?: string;
  agentThreadId?: string | number;
  agentGroupId?: string | null;
  agentGroupChannel?: string | null;
  agentGroupSpace?: string | null;
  agentDir?: string;
  sandboxRoot?: string;
  sandboxFsBridge?: SandboxFsBridge;
  fsPolicy?: ToolFsPolicy;
  workspaceDir?: string;
  sandboxed?: boolean;
  config?: ApmClawConfig;
  pluginToolAllowlist?: string[];
  currentChannelId?: string;
  currentThreadTs?: string;
  currentMessageId?: string | number;
  replyToMode?: "off" | "first" | "all";
  hasRepliedRef?: { value: boolean };
  modelHasVision?: boolean;
  requesterAgentIdOverride?: string;
  requireExplicitMessageTarget?: boolean;
  disableMessageTool?: boolean;
  requesterSenderId?: string | null;
  senderIsOwner?: boolean;
  sessionId?: string;
}): AnyAgentTool[] {
  const workspaceDir = resolveWorkspaceRoot(options?.workspaceDir);

  // Removed: Lean Strong Claw - image tool (modelHasVision=true makes this redundant)
  // const imageTool = options?.agentDir?.trim()
  //   ? createImageTool({
  //       config: options?.config,
  //       agentDir: options.agentDir,
  //       workspaceDir,
  //       sandbox: options?.sandboxRoot && options?.sandboxFsBridge ? { root: options.sandboxRoot, bridge: options.sandboxFsBridge } : undefined,
  //       fsPolicy: options?.fsPolicy,
  //       modelHasVision: options?.modelHasVision,
  //     })
  //   : null;

  const webSearchTool = createWebSearchTool({
    config: options?.config,
    sandboxed: options?.sandboxed,
  });

  const webFetchTool = createWebFetchTool({
    config: options?.config,
    sandboxed: options?.sandboxed,
  });

  const messageTool = options?.disableMessageTool
    ? null
    : createMessageTool({
        agentAccountId: options?.agentAccountId,
        agentSessionKey: options?.agentSessionKey,
        config: options?.config,
        currentChannelId: options?.currentChannelId,
        currentChannelProvider: options?.agentChannel,
        currentThreadTs: options?.currentThreadTs,
        currentMessageId: options?.currentMessageId,
        replyToMode: options?.replyToMode,
        hasRepliedRef: options?.hasRepliedRef,
        sandboxRoot: options?.sandboxRoot,
        requireExplicitTarget: options?.requireExplicitMessageTarget,
        requesterSenderId: options?.requesterSenderId ?? undefined,
      });

  const tools: AnyAgentTool[] = (
    [
      // Removed: Lean Strong Claw - cron tool (ownerOnly, not usable in Telegram)
      // createCronTool({
      //   agentSessionKey: options?.agentSessionKey,
      // }),
      messageTool,
      // Removed: Lean Strong Claw - agents_list (requires sessions_spawn which was removed)
      // createAgentsListTool({
      //   agentSessionKey: options?.agentSessionKey,
      //   requesterAgentIdOverride: options?.requesterAgentIdOverride,
      // }),
      // Removed: Lean Strong Claw - sessions_* tools (no subagents, no use case)
      // createSessionsListTool({
      //   agentSessionKey: options?.agentSessionKey,
      //   sandboxed: options?.sandboxed,
      // }),
      // createSessionsHistoryTool({
      //   agentSessionKey: options?.agentSessionKey,
      //   sandboxed: options?.sandboxed,
      // }),
      // createSessionsSendTool({
      //   agentSessionKey: options?.agentSessionKey,
      //   agentChannel: options?.agentChannel,
      //   sandboxed: options?.sandboxed,
      // }),
      // Removed: Subagents tool dependency
      // createSessionsSpawnTool({
      //   agentSessionKey: options?.agentSessionKey,
      //   agentChannel: options?.agentChannel,
      //   agentAccountId: options?.agentAccountId,
      //   agentTo: options?.agentTo,
      //   agentThreadId: options?.agentThreadId,
      //   agentGroupId: options?.agentGroupId,
      //   agentGroupChannel: options?.agentGroupChannel,
      //   agentGroupSpace: options?.agentGroupSpace,
      //   sandboxed: options?.sandboxed,
      //   requesterAgentIdOverride: options?.requesterAgentIdOverride,
      // }),
      createMemorySearchTool({
        config: options?.config,
        agentSessionKey: options?.agentSessionKey,
      }),
      createMemoryGetTool({
        config: options?.config,
        agentSessionKey: options?.agentSessionKey,
      }),
      createMemorySaveTool({
        config: options?.config,
        agentId: resolveSessionAgentId({
          sessionKey: options?.agentSessionKey,
          config: options?.config,
        }),
        workspaceDir: options?.workspaceDir,
      }),
      createMemoryProposeTool({
        config: options?.config,
        agentId: resolveSessionAgentId({
          sessionKey: options?.agentSessionKey,
          config: options?.config,
        }),
        workspaceDir: options?.workspaceDir,
      }),
      // Removed: Lean Strong Claw - session_status (system info, not PM-E's job)
      // createSessionStatusTool({
      //   agentSessionKey: options?.agentSessionKey,
      //   config: options?.config,
      // }),
      webSearchTool,
      webFetchTool,
      // Removed: Lean Strong Claw - image tool (modelHasVision=true makes this redundant)
      // imageTool,
    ] as Array<AnyAgentTool | null>
  ).filter(Boolean) as AnyAgentTool[];

  const pluginTools = resolvePluginTools({
    context: {
      config: options?.config,
      workspaceDir,
      agentDir: options?.agentDir,
      agentId: resolveSessionAgentId({
        sessionKey: options?.agentSessionKey,
        config: options?.config,
      }),
      sessionKey: options?.agentSessionKey,
      sessionId: options?.sessionId,
      messageChannel: options?.agentChannel,
      agentAccountId: options?.agentAccountId,
      requesterSenderId: options?.requesterSenderId ?? undefined,
      senderIsOwner: options?.senderIsOwner ?? undefined,
      sandboxed: options?.sandboxed,
    },
    existingToolNames: new Set(tools.map((tool) => tool.name)),
    toolAllowlist: options?.pluginToolAllowlist,
  });

  return [...tools, ...pluginTools];
}
