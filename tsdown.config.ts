import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/entry.ts",
    "src/extensionAPI.ts",
    "src/channels/plugins/actions/telegram.ts",
    "src/telegram/audit.ts",
    "src/telegram/token.ts",
  ],
  format: ["esm"],
  target: "node22.12.0",
  clean: true,
  dts: false,
  skipNodeModulesBundle: true,
});
