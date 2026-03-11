import { codingTools } from "@mariozechner/pi-coding-agent";
import type { ApmClawConfig } from "../config/config.js";
import type { ToolLoopDetectionConfig } from "../config/types.tools.js";
import { resolveMergedSafeBinProfileFixtures } from "../infra/exec-safe-bin-runtime-policy.js";
import { logWarn } from "../logger.js";
import { getPluginToolMeta } from "../plugins/tools.js";
import { isSubagentSessionKey } from "../routing/session-key.js";
import { resolveGatewayMessageChannel } from "../utils/message-channel.js";
import { resolveAgentConfig } from "./agent-scope.js";
type ExecToolDefaults = Record<string, unknown>;
type ProcessToolDefaults = Record<string, unknown>;
import { listChannelAgentTools } from "./channel-tools.js";
import { resolveImageSanitizationLimits } from "./image-sanitization.js";
import type { ModelAuthMode } from "./model-auth.js";
import { createApmClawTools } from "./openclaw-tools.js";
import { wrapToolWithAbortSignal } from "./pi-tools.abort.js";
import { wrapToolWithBeforeToolCallHook } from "./pi-tools.before-tool-call.js";
import {
  isToolAllowedByPolicies,
  resolveEffectiveToolPolicy,
  resolveGroupToolPolicy,
  resolveSubagentToolPolicy,
} from "./pi-tools.policy.js";
import { cleanToolSchemaForGemini, normalizeToolParameters } from "./pi-tools.schema.js";
import type { AnyAgentTool } from "./pi-tools.types.js";
import type { SandboxContext } from "./sandbox.js";
import { isXaiProvider } from "./schema/clean-for-xai.js";
// Removed: Subagents tool dependency
// import { getSubagentDepthFromSessionStore } from "./subagent-depth.js";
import { createToolFsPolicy, resolveToolFsConfig } from "./tool-fs-policy.js";
import {
  applyToolPolicyPipeline,
  buildDefaultToolPolicyPipelineSteps,
} from "./tool-policy-pipeline.js";
import {
  applyOwnerOnlyToolPolicy,
  collectExplicitAllowlist,
  mergeAlsoAllowPolicy,
  resolveToolProfilePolicy,
} from "./tool-policy.js";
import { resolveWorkspaceRoot } from "./workspace-dir.js";

function isOpenAIProvider(provider?: string) {
  const normalized = provider?.trim().toLowerCase();
  return normalized === "openai" || normalized === "openai-codex";
}

const TOOL_DENY_BY_MESSAGE_PROVIDER: Readonly<Record<string, readonly string[]>> = {
  voice: ["tts"],
};
const TOOL_DENY_FOR_XAI_PROVIDERS = new Set(["web_search"]);

function normalizeMessageProvider(messageProvider?: string): string | undefined {
  const normalized = messageProvider?.trim().toLowerCase();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function applyMessageProviderToolPolicy(
  tools: AnyAgentTool[],
  messageProvider?: string,
): AnyAgentTool[] {
  const normalizedProvider = normalizeMessageProvider(messageProvider);
  if (!normalizedProvider) {
    return tools;
  }
  const deniedTools = TOOL_DENY_BY_MESSAGE_PROVIDER[normalizedProvider];
  if (!deniedTools || deniedTools.length === 0) {
    return tools;
  }
  const deniedSet = new Set(deniedTools);
  return tools.filter((tool) => !deniedSet.has(tool.name));
}

function applyModelProviderToolPolicy(
  tools: AnyAgentTool[],
  params?: { modelProvider?: string; modelId?: string },
): AnyAgentTool[] {
  if (!isXaiProvider(params?.modelProvider, params?.modelId)) {
    return tools;
  }
  // xAI/Grok providers expose a native web_search tool; sending ApmClaw's
  // web_search alongside it causes duplicate-name request failures.
  return tools.filter((tool) => !TOOL_DENY_FOR_XAI_PROVIDERS.has(tool.name));
}

function resolveExecConfig(params: { cfg?: ApmClawConfig; agentId?: string }) {
  const cfg = params.cfg;
  const globalExec = cfg?.tools?.exec;
  const agentExec =
    cfg && params.agentId ? resolveAgentConfig(cfg, params.agentId)?.tools?.exec : undefined;
  return {
    host: agentExec?.host ?? globalExec?.host,
    security: agentExec?.security ?? globalExec?.security,
    ask: agentExec?.ask ?? globalExec?.ask,
    node: agentExec?.node ?? globalExec?.node,
    pathPrepend: agentExec?.pathPrepend ?? globalExec?.pathPrepend,
    safeBins: agentExec?.safeBins ?? globalExec?.safeBins,
    safeBinTrustedDirs: agentExec?.safeBinTrustedDirs ?? globalExec?.safeBinTrustedDirs,
    safeBinProfiles: resolveMergedSafeBinProfileFixtures({
      global: globalExec,
      local: agentExec,
    }),
    backgroundMs: agentExec?.backgroundMs ?? globalExec?.backgroundMs,
    timeoutSec: agentExec?.timeoutSec ?? globalExec?.timeoutSec,
    approvalRunningNoticeMs:
      agentExec?.approvalRunningNoticeMs ?? globalExec?.approvalRunningNoticeMs,
    cleanupMs: agentExec?.cleanupMs ?? globalExec?.cleanupMs,
    notifyOnExit: agentExec?.notifyOnExit ?? globalExec?.notifyOnExit,
    notifyOnExitEmptySuccess:
      agentExec?.notifyOnExitEmptySuccess ?? globalExec?.notifyOnExitEmptySuccess,
    applyPatch: agentExec?.applyPatch ?? globalExec?.applyPatch,
  };
}

export function resolveToolLoopDetectionConfig(params: {
  cfg?: ApmClawConfig;
  agentId?: string;
}): ToolLoopDetectionConfig | undefined {
  const global = params.cfg?.tools?.loopDetection;
  const agent =
    params.agentId && params.cfg
      ? resolveAgentConfig(params.cfg, params.agentId)?.tools?.loopDetection
      : undefined;

  if (!agent) {
    return global;
  }
  if (!global) {
    return agent;
  }

  return {
    ...global,
    ...agent,
    detectors: {
      ...global.detectors,
      ...agent.detectors,
    },
  };
}

export const __testing = {
  cleanToolSchemaForGemini,
  applyModelProviderToolPolicy,
} as const;

export function createApmClawCodingTools(options?: {
  agentId?: string;
  exec?: ExecToolDefaults & ProcessToolDefaults;
  messageProvider?: string;
  agentAccountId?: string;
  messageTo?: string;
  messageThreadId?: string | number;
  sandbox?: SandboxContext | null;
  sessionKey?: string;
  /** Ephemeral session UUID — regenerated on /new and /reset. */
  sessionId?: string;
  /** Stable run identifier for this agent invocation. */
  runId?: string;
  agentDir?: string;
  workspaceDir?: string;
  config?: ApmClawConfig;
  abortSignal?: AbortSignal;
  /**
   * Provider of the currently selected model (used for provider-specific tool quirks).
   * Example: "anthropic", "openai", "google", "openai-codex".
   */
  modelProvider?: string;
  /** Model id for the current provider (used for model-specific tool gating). */
  modelId?: string;
  /** Model context window in tokens (used to scale read-tool output budget). */
  modelContextWindowTokens?: number;
  /**
   * Auth mode for the current provider. We only need this for Anthropic OAuth
   * tool-name blocking quirks.
   */
  modelAuthMode?: ModelAuthMode;
  /** Current channel ID for auto-threading (Slack). */
  currentChannelId?: string;
  /** Current thread timestamp for auto-threading (Slack). */
  currentThreadTs?: string;
  /** Current inbound message id for action fallbacks (e.g. Telegram react). */
  currentMessageId?: string | number;
  /** Group id for channel-level tool policy resolution. */
  groupId?: string | null;
  /** Group channel label (e.g. #general) for channel-level tool policy resolution. */
  groupChannel?: string | null;
  /** Group space label (e.g. guild/team id) for channel-level tool policy resolution. */
  groupSpace?: string | null;
  /** Parent session key for subagent group policy inheritance. */
  spawnedBy?: string | null;
  senderId?: string | null;
  senderName?: string | null;
  senderUsername?: string | null;
  senderE164?: string | null;
  /** Reply-to mode for Slack auto-threading. */
  replyToMode?: "off" | "first" | "all";
  /** Mutable ref to track if a reply was sent (for "first" mode). */
  hasRepliedRef?: { value: boolean };
  /** If true, the model has native vision capability */
  modelHasVision?: boolean;
  /** Require explicit message targets (no implicit last-route sends). */
  requireExplicitMessageTarget?: boolean;
  /** If true, omit the message tool from the tool list. */
  disableMessageTool?: boolean;
  /** Whether the sender is an owner (required for owner-only tools). */
  senderIsOwner?: boolean;
}): AnyAgentTool[] {
  const execToolName = "exec";
  const sandbox = options?.sandbox?.enabled ? options.sandbox : undefined;
  const {
    agentId,
    globalPolicy,
    globalProviderPolicy,
    agentPolicy,
    agentProviderPolicy,
    profile,
    providerProfile,
    profileAlsoAllow,
    providerProfileAlsoAllow,
  } = resolveEffectiveToolPolicy({
    config: options?.config,
    sessionKey: options?.sessionKey,
    agentId: options?.agentId,
    modelProvider: options?.modelProvider,
    modelId: options?.modelId,
  });
  const groupPolicy = resolveGroupToolPolicy({
    config: options?.config,
    sessionKey: options?.sessionKey,
    spawnedBy: options?.spawnedBy,
    messageProvider: options?.messageProvider,
    groupId: options?.groupId,
    groupChannel: options?.groupChannel,
    groupSpace: options?.groupSpace,
    accountId: options?.agentAccountId,
    senderId: options?.senderId,
    senderName: options?.senderName,
    senderUsername: options?.senderUsername,
    senderE164: options?.senderE164,
  });
  const profilePolicy = resolveToolProfilePolicy(profile);
  const providerProfilePolicy = resolveToolProfilePolicy(providerProfile);

  const profilePolicyWithAlsoAllow = mergeAlsoAllowPolicy(profilePolicy, profileAlsoAllow);
  const providerProfilePolicyWithAlsoAllow = mergeAlsoAllowPolicy(
    providerProfilePolicy,
    providerProfileAlsoAllow,
  );
  // Prefer sessionKey for process isolation scope to prevent cross-session process visibility/killing.
  // Fallback to agentId if no sessionKey is available (e.g. legacy or global contexts).
  const scopeKey =
    options?.exec?.scopeKey ?? options?.sessionKey ?? (agentId ? `agent:${agentId}` : undefined);
  // Removed: Subagents tool dependency
  // const subagentPolicy = isSubagentSessionKey(options?.sessionKey) && options?.sessionKey
  //   ? resolveSubagentToolPolicy(options.config, getSubagentDepthFromSessionStore(...))
  //   : undefined;
  const subagentPolicy = undefined;
  const execConfig = resolveExecConfig({ cfg: options?.config, agentId });
  const fsConfig = resolveToolFsConfig({ cfg: options?.config, agentId });
  const fsPolicy = createToolFsPolicy({
    workspaceOnly: fsConfig.workspaceOnly,
  });
  const sandboxRoot = sandbox?.workspaceDir;
  const sandboxFsBridge = sandbox?.fsBridge;
  const workspaceRoot = resolveWorkspaceRoot(options?.workspaceDir);

  if (sandboxRoot && !sandboxFsBridge) {
    throw new Error("Sandbox filesystem bridge is unavailable.");
  }

  const base = (codingTools as unknown as AnyAgentTool[]).flatMap((tool) => {
    // Physically removed RW tools from core.
    if (["read", "write", "edit", "bash", execToolName, "apply_patch"].includes(tool.name)) {
      return [];
    }
    return [tool];
  });

  const tools: AnyAgentTool[] = [
    ...base,
    // Channel docking: include channel-defined agent tools (login, etc.).
    ...listChannelAgentTools({ cfg: options?.config }),
    ...createApmClawTools({
      agentSessionKey: options?.sessionKey,
      agentChannel: resolveGatewayMessageChannel(options?.messageProvider),
      agentAccountId: options?.agentAccountId,
      agentTo: options?.messageTo,
      agentThreadId: options?.messageThreadId,
      agentGroupId: options?.groupId ?? null,
      agentGroupChannel: options?.groupChannel ?? null,
      agentGroupSpace: options?.groupSpace ?? null,
      agentDir: options?.agentDir,
      sandboxRoot,
      sandboxFsBridge,
      fsPolicy,
      workspaceDir: workspaceRoot,
      sandboxed: !!sandbox,
      config: options?.config,
      pluginToolAllowlist: collectExplicitAllowlist([
        profilePolicy,
        providerProfilePolicy,
        globalPolicy,
        globalProviderPolicy,
        agentPolicy,
        agentProviderPolicy,
        groupPolicy,
        sandbox?.tools,
        subagentPolicy,
      ]),
      currentChannelId: options?.currentChannelId,
      currentThreadTs: options?.currentThreadTs,
      currentMessageId: options?.currentMessageId,
      replyToMode: options?.replyToMode,
      hasRepliedRef: options?.hasRepliedRef,
      modelHasVision: options?.modelHasVision,
      requireExplicitMessageTarget: options?.requireExplicitMessageTarget,
      disableMessageTool: options?.disableMessageTool,
      requesterAgentIdOverride: agentId,
      requesterSenderId: options?.senderId,
      senderIsOwner: options?.senderIsOwner,
      sessionId: options?.sessionId,
    }),
  ];
  const toolsForMessageProvider = applyMessageProviderToolPolicy(tools, options?.messageProvider);
  const toolsForModelProvider = applyModelProviderToolPolicy(toolsForMessageProvider, {
    modelProvider: options?.modelProvider,
    modelId: options?.modelId,
  });
  // Security: treat unknown/undefined as unauthorized (opt-in, not opt-out)
  const senderIsOwner = options?.senderIsOwner === true;
  const toolsByAuthorization = applyOwnerOnlyToolPolicy(toolsForModelProvider, senderIsOwner);
  const subagentFiltered = applyToolPolicyPipeline({
    tools: toolsByAuthorization,
    toolMeta: (tool) => getPluginToolMeta(tool),
    warn: logWarn,
    steps: [
      ...buildDefaultToolPolicyPipelineSteps({
        profilePolicy: profilePolicyWithAlsoAllow,
        profile,
        providerProfilePolicy: providerProfilePolicyWithAlsoAllow,
        providerProfile,
        globalPolicy,
        globalProviderPolicy,
        agentPolicy,
        agentProviderPolicy,
        groupPolicy,
        agentId,
      }),
      { policy: sandbox?.tools, label: "sandbox tools.allow" },
      { policy: subagentPolicy, label: "subagent tools.allow" },
    ],
  });
  // Always normalize tool JSON Schemas before handing them to pi-agent/pi-ai.
  // Without this, some providers (notably OpenAI) will reject root-level union schemas.
  // Provider-specific cleaning: Gemini needs constraint keywords stripped, but Anthropic expects them.
  const normalized = subagentFiltered.map((tool) =>
    normalizeToolParameters(tool, {
      modelProvider: options?.modelProvider,
      modelId: options?.modelId,
    }),
  );
  const withHooks = normalized.map((tool) =>
    wrapToolWithBeforeToolCallHook(tool, {
      agentId,
      sessionKey: options?.sessionKey,
      sessionId: options?.sessionId,
      runId: options?.runId,
      loopDetection: resolveToolLoopDetectionConfig({ cfg: options?.config, agentId }),
    }),
  );
  const withAbort = options?.abortSignal
    ? withHooks.map((tool) => wrapToolWithAbortSignal(tool, options.abortSignal))
    : withHooks;

  // NOTE: Keep canonical (lowercase) tool names here.
  // pi-ai's Anthropic OAuth transport remaps tool names to Claude Code-style names
  // on the wire and maps them back for tool dispatch.
  return withAbort;
}
