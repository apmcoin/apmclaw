import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/entry.ts",
    "src/extensionAPI.ts",
    "src/infra/warning-filter.ts",
    "src/channels/plugins/actions/telegram.ts",
    "src/telegram/audit.ts",
    "src/telegram/token.ts",
    "src/hooks/llm-slug-generator.ts",
    "src/hooks/bundled/boot-md/handler.ts",
    "src/hooks/bundled/bootstrap-extra-files/handler.ts",
    "src/hooks/bundled/session-memory/handler.ts",
    "src/hooks/bundled/command-logger/handler.ts",
  ],
  format: ["esm"],
  target: "node22.12.0",
  clean: true,
  dts: false,
  skipNodeModulesBundle: true,
});
