type ExecElevatedDefaults = Record<string, unknown>;
import type { resolveSandboxContext } from "../sandbox.js";
import type { EmbeddedSandboxInfo } from "./types.js";

export function buildEmbeddedSandboxInfo(
  sandbox?: Awaited<ReturnType<typeof resolveSandboxContext>>,
  execElevated?: ExecElevatedDefaults,
): EmbeddedSandboxInfo | undefined {
  if (!sandbox?.enabled) {
    return undefined;
  }
  const elevatedAllowed = Boolean(execElevated?.enabled && execElevated.allowed);
  const defaultLevel = ((): "on" | "off" | "ask" | "full" => {
    const raw = execElevated?.defaultLevel;
    if (raw === "on" || raw === "off" || raw === "ask" || raw === "full") {
      return raw;
    }
    return "off";
  })();

  return {
    enabled: true,
    workspaceDir: sandbox.workspaceDir,
    containerWorkspaceDir: sandbox.containerWorkdir,
    workspaceAccess: sandbox.workspaceAccess,
    agentWorkspaceMount: sandbox.workspaceAccess === "ro" ? "/agent" : undefined,
    browserBridgeUrl: sandbox.browser?.bridgeUrl,
    browserNoVncUrl: sandbox.browser?.noVncUrl,
    hostBrowserAllowed: sandbox.browserAllowHostControl,
    ...(elevatedAllowed
      ? {
          elevated: {
            allowed: true,
            defaultLevel,
          },
        }
      : {}),
  };
}
