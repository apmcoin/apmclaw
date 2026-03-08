import { defineConfig } from "tsdown";

const env = {
  NODE_ENV: "production",
};

const pluginSdkEntrypoints = [
  "index",
  "core",
  "compat",
  "telegram",
  "signal",
  "line",
  "msteams",
  "acpx",
  "bluebubbles",
  "copilot-proxy",
  "device-pair",
  "diagnostics-otel",
  "diffs",
  "feishu",
  "google-gemini-cli-auth",
  "googlechat",
  "irc",
  "llm-task",
  "lobster",
  "matrix",
  "mattermost",
  "memory-core",
  "memory-lancedb",
  "minimax-portal-auth",
  "nextcloud-talk",
  "nostr",
  "open-prose",
  "phone-control",
  "qwen-portal-auth",
  "synology-chat",
  "talk-voice",
  "test-utils",
  "thread-ownership",
  "tlon",
  "twitch",
  "zalo",
  "zalouser",
  "account-id",
  "keyed-async-queue",
] as const;

export default defineConfig([
  {
    entry: "src/index.ts",
    env,
    fixedExtension: false,
    platform: "node",
  },
  {
    entry: "src/entry.ts",
    env,
    fixedExtension: false,
    platform: "node",
  },
  // Daemon CLI removed (Docker-only deployment)
  {
    entry: "src/infra/warning-filter.ts",
    env,
    fixedExtension: false,
    platform: "node",
  },
  {
    // Keep sync lazy-runtime channel modules as concrete dist files.
    entry: {
      "channels/plugins/actions/signal": "src/channels/plugins/actions/signal.ts",
      "channels/plugins/actions/telegram": "src/channels/plugins/actions/telegram.ts",
      "telegram/audit": "src/telegram/audit.ts",
      "telegram/token": "src/telegram/token.ts",
      "line/accounts": "src/line/accounts.ts",
      "line/send": "src/line/send.ts",
      "line/template-messages": "src/line/template-messages.ts",
    },
    env,
    fixedExtension: false,
    platform: "node",
  },
  ...pluginSdkEntrypoints.map((entry) => ({
    entry: `src/plugin-sdk/${entry}.ts`,
    outDir: "dist/plugin-sdk",
    env,
    fixedExtension: false,
    platform: "node" as const,
  })),
  {
    entry: "src/extensionAPI.ts",
    env,
    fixedExtension: false,
    platform: "node",
  },
  {
    entry: ["src/hooks/bundled/*/handler.ts", "src/hooks/llm-slug-generator.ts"],
    env,
    fixedExtension: false,
    platform: "node",
  },
]);
