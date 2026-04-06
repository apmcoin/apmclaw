import { createRequire } from "node:module";
import { resolveStateDir } from "../../config/paths.js";
import { shouldLogVerbose } from "../../globals.js";
import { getChildLogger } from "../../logging.js";
import { transcribeAudioFile } from "../../media-understanding/transcribe-audio.js";
import { createRuntimeConfig } from "./runtime-config.js";
import type { PluginRuntime } from "./types.js";

// Plugin runtime subsystems removed — only config and version remain.

let cachedVersion: string | null = null;

function resolveVersion(): string {
  if (cachedVersion) {
    return cachedVersion;
  }
  try {
    const require = createRequire(import.meta.url);
    const pkg = require("../../../package.json") as { version?: string };
    cachedVersion = pkg.version ?? "unknown";
    return cachedVersion;
  } catch {
    cachedVersion = "unknown";
    return cachedVersion;
  }
}

function createUnavailableSubagentRuntime(): PluginRuntime["subagent"] {
  const unavailable = () => {
    throw new Error("Plugin runtime subagent methods are only available during a gateway request.");
  };
  return {
    run: unavailable,
    waitForRun: unavailable,
    getSessionMessages: unavailable,
    getSession: unavailable,
    deleteSession: unavailable,
  };
}

export type CreatePluginRuntimeOptions = {
  subagent?: PluginRuntime["subagent"];
};

export function createPluginRuntime(_options: CreatePluginRuntimeOptions = {}): PluginRuntime {
  const noop = () => ({});
  const runtime = {
    version: resolveVersion(),
    config: createRuntimeConfig(),
    subagent: _options.subagent ?? createUnavailableSubagentRuntime(),
    system: noop() as PluginRuntime["system"],
    media: noop() as PluginRuntime["media"],
    stt: { transcribeAudioFile },
    tools: noop() as PluginRuntime["tools"],
    channel: noop() as PluginRuntime["channel"],
    events: noop() as PluginRuntime["events"],
    logging: { shouldLogVerbose, getChildLogger },
    state: { resolveStateDir },
  } satisfies PluginRuntime;

  return runtime;
}

export type { PluginRuntime } from "./types.js";
