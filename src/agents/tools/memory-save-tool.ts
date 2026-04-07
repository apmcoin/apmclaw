import fs from "node:fs/promises";
import path from "node:path";
import { Type } from "@sinclair/typebox";
import { resolveAgentWorkspaceDir } from "../agent-scope.js";
import { resolveWorkspaceRoot } from "../workspace-dir.js";
import type { AnyAgentTool } from "./common.js";
import { jsonResult, readStringParam } from "./common.js";

const MemorySaveSchema = Type.Object({
  content: Type.String({
    description: "The new pattern, rule, or information to remember. Be concise.",
  }),
  category: Type.Optional(
    Type.String({ description: "Category like 'admin_instruction', 'spam_pattern', etc." }),
  ),
});

/**
 * memory_save tool: TEMPORARILY DISABLED - Under redesign for Memory Proposal System.
 *
 * Security Issue: Direct memory writes allow memory poisoning attacks.
 * New Design: Memory Proposal System with admin approval (see README.md).
 *
 * Spam patterns are handled by spam_delete / spam_delete_and_pattern_report tools instead.
 */
export function createMemorySaveTool(options: {
  config?: any;
  agentId?: string;
  workspaceDir?: string;
}): AnyAgentTool {
  return {
    label: "Memory Save",
    name: "memory_save",
    description:
      "⚠️ DISABLED: This tool is temporarily unavailable during Memory Proposal System implementation. Memory writes now require admin approval to prevent poisoning attacks. You can still use memory_search and memory_get to read existing knowledge.",
    parameters: MemorySaveSchema,
    execute: async (_toolCallId, params) => {
      // DISABLED: Return error message instead of writing
      return jsonResult({
        success: false,
        error:
          "memory_save is temporarily disabled. Memory Proposal System under implementation. Use memory_search to access existing knowledge.",
      });

      /* ORIGINAL CODE (disabled):
      const content = readStringParam(params, "content", { required: true });
      const category = readStringParam(params, "category") || "general";

      const workspaceDir = resolveWorkspaceRoot(options.workspaceDir);
      const memoryFilePath = path.join(workspaceDir, "MEMORY.md");

      const timestamp = new Date().toISOString();
      const entry = `\n\n### [${timestamp}] Category: ${category}\n${content.trim()}`;

      try {
        await fs.appendFile(memoryFilePath, entry, "utf-8");
        return jsonResult({ success: true, message: "Information saved to MEMORY.md successfully." });
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        return jsonResult({ success: false, error: `Failed to save to memory: ${error}` });
      }
      */
    },
  };
}
