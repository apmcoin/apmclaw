import fs from "node:fs/promises";
import { resetAcpSessionInPlace } from "../../acp/persistent-bindings.js";
import { logVerbose } from "../../globals.js";
import { isAcpSessionKey } from "../../routing/session-key.js";
import { resolveSendPolicy } from "../../sessions/send-policy.js";
import { shouldHandleTextCommands } from "../commands-registry.js";
import { handleApproveCommand } from "./commands-approve.js";
import { handleConfigCommand, handleDebugCommand } from "./commands-config.js";
import {
  handleCommandsListCommand,
  handleContextCommand,
  handleHelpCommand,
  handleStatusCommand,
  handleWhoamiCommand,
} from "./commands-info.js";
import { handleModelsCommand } from "./commands-models.js";
import {
  handleAbortTrigger,
  handleActivationCommand,
  handleRestartCommand,
  handleSessionCommand,
  handleSendPolicyCommand,
  handleStopCommand,
  handleUsageCommand,
} from "./commands-session.js";
// Removed: Subagents tool dependency
// import { handleSubagentsCommand } from "./commands-subagents.js";
import type {
  CommandHandler,
  CommandHandlerResult,
  HandleCommandsParams,
} from "./commands-types.js";
import { routeReply } from "./route-reply.js";

let HANDLERS: CommandHandler[] | null = null;

export type ResetCommandAction = "new" | "reset";

export async function emitResetCommandHooks(params: {
  action: ResetCommandAction;
  ctx: HandleCommandsParams["ctx"];
  cfg: HandleCommandsParams["cfg"];
  command: Pick<
    HandleCommandsParams["command"],
    "surface" | "senderId" | "channel" | "from" | "to" | "resetHookTriggered"
  >;
  sessionKey?: string;
  sessionEntry?: HandleCommandsParams["sessionEntry"];
  previousSessionEntry?: HandleCommandsParams["previousSessionEntry"];
  workspaceDir: string;
}): Promise<void> {
  params.command.resetHookTriggered = true;
}

function applyAcpResetTailContext(ctx: HandleCommandsParams["ctx"], resetTail: string): void {
  const mutableCtx = ctx as Record<string, unknown>;
  mutableCtx.Body = resetTail;
  mutableCtx.RawBody = resetTail;
  mutableCtx.CommandBody = resetTail;
  mutableCtx.BodyForCommands = resetTail;
  mutableCtx.BodyForAgent = resetTail;
  mutableCtx.BodyStripped = resetTail;
  mutableCtx.AcpDispatchTailAfterReset = true;
}

function resolveSessionEntryForHookSessionKey(
  sessionStore: HandleCommandsParams["sessionStore"] | undefined,
  sessionKey: string,
): HandleCommandsParams["sessionEntry"] | undefined {
  if (!sessionStore) {
    return undefined;
  }
  const directEntry = sessionStore[sessionKey];
  if (directEntry) {
    return directEntry;
  }
  const normalizedTarget = sessionKey.trim().toLowerCase();
  if (!normalizedTarget) {
    return undefined;
  }
  for (const [candidateKey, candidateEntry] of Object.entries(sessionStore)) {
    if (candidateKey.trim().toLowerCase() === normalizedTarget) {
      return candidateEntry;
    }
  }
  return undefined;
}

export async function handleCommands(params: HandleCommandsParams): Promise<CommandHandlerResult> {
  if (HANDLERS === null) {
    HANDLERS = [
      handleActivationCommand,
      handleSendPolicyCommand,
      handleUsageCommand,
      handleSessionCommand,
      handleRestartCommand,
      handleHelpCommand,
      handleCommandsListCommand,
      handleStatusCommand,
      handleApproveCommand,
      handleContextCommand,
      handleWhoamiCommand,
      // Removed: handlePluginCommand, handleSubagentsCommand, handleBashCommand, handleExportSessionCommand, handleAcpCommand, handleCompactCommand
      handleConfigCommand,
      handleDebugCommand,
      handleModelsCommand,
      handleStopCommand,
      handleAbortTrigger,
    ];
  }
  const resetMatch = params.command.commandBodyNormalized.match(/^\/(new|reset)(?:\s|$)/);
  const resetRequested = Boolean(resetMatch);
  if (resetRequested && !params.command.isAuthorizedSender) {
    logVerbose(
      `Ignoring /reset from unauthorized sender: ${params.command.senderId || "<unknown>"}`,
    );
    return { shouldContinue: false };
  }

  // Trigger internal hook for reset/new commands
  if (resetRequested && params.command.isAuthorizedSender) {
    const commandAction: ResetCommandAction = resetMatch?.[1] === "reset" ? "reset" : "new";
    const resetTail =
      resetMatch != null
        ? params.command.commandBodyNormalized.slice(resetMatch[0].length).trimStart()
        : "";
    const boundAcpSessionKey = resolveBoundAcpThreadSessionKey(params);
    const boundAcpKey =
      boundAcpSessionKey && isAcpSessionKey(boundAcpSessionKey)
        ? boundAcpSessionKey.trim()
        : undefined;
    if (boundAcpKey) {
      const resetResult = await resetAcpSessionInPlace({
        cfg: params.cfg,
        sessionKey: boundAcpKey,
        reason: commandAction,
      });
      if (!resetResult.ok && !resetResult.skipped) {
        logVerbose(
          `acp reset-in-place failed for ${boundAcpKey}: ${resetResult.error ?? "unknown error"}`,
        );
      }
      if (resetResult.ok) {
        const hookSessionEntry =
          boundAcpKey === params.sessionKey
            ? params.sessionEntry
            : resolveSessionEntryForHookSessionKey(params.sessionStore, boundAcpKey);
        const hookPreviousSessionEntry =
          boundAcpKey === params.sessionKey
            ? params.previousSessionEntry
            : resolveSessionEntryForHookSessionKey(params.sessionStore, boundAcpKey);
        await emitResetCommandHooks({
          action: commandAction,
          ctx: params.ctx,
          cfg: params.cfg,
          command: params.command,
          sessionKey: boundAcpKey,
          sessionEntry: hookSessionEntry,
          previousSessionEntry: hookPreviousSessionEntry,
          workspaceDir: params.workspaceDir,
        });
        if (resetTail) {
          applyAcpResetTailContext(params.ctx, resetTail);
          if (params.rootCtx && params.rootCtx !== params.ctx) {
            applyAcpResetTailContext(params.rootCtx, resetTail);
          }
          return {
            shouldContinue: false,
          };
        }
        return {
          shouldContinue: false,
          reply: { text: "✅ ACP session reset in place." },
        };
      }
      if (resetResult.skipped) {
        return {
          shouldContinue: false,
          reply: {
            text: "⚠️ ACP session reset unavailable for this bound conversation. Rebind with /acp bind or /acp spawn.",
          },
        };
      }
      return {
        shouldContinue: false,
        reply: {
          text: "⚠️ ACP session reset failed. Check /acp status and try again.",
        },
      };
    }
    await emitResetCommandHooks({
      action: commandAction,
      ctx: params.ctx,
      cfg: params.cfg,
      command: params.command,
      sessionKey: params.sessionKey,
      sessionEntry: params.sessionEntry,
      previousSessionEntry: params.previousSessionEntry,
      workspaceDir: params.workspaceDir,
    });
  }

  const allowTextCommands = shouldHandleTextCommands({
    cfg: params.cfg,
    surface: params.command.surface,
    commandSource: params.ctx.CommandSource,
  });

  for (const handler of HANDLERS) {
    const result = await handler(params, allowTextCommands);
    if (result) {
      return result;
    }
  }

  const sendPolicy = resolveSendPolicy({
    cfg: params.cfg,
    entry: params.sessionEntry,
    sessionKey: params.sessionKey,
    channel: params.sessionEntry?.channel ?? params.command.channel,
    chatType: params.sessionEntry?.chatType,
  });
  if (sendPolicy === "deny") {
    logVerbose(`Send blocked by policy for session ${params.sessionKey ?? "unknown"}`);
    return { shouldContinue: false };
  }

  return { shouldContinue: true };
}
