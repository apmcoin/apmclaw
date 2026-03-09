import { Type } from "@sinclair/typebox";
import fs from "node:fs/promises";
import path from "node:path";
import { resolveAgentWorkspaceDir } from "../agent-scope.js";
import { resolveWorkspaceRoot } from "../workspace-dir.js";
import type { AnyAgentTool } from "./common.js";
import { jsonResult, readStringParam } from "./common.js";

const MemorySaveSchema = Type.Object({
  content: Type.String({ description: "The new pattern, rule, or information to remember. Be concise." }),
  category: Type.Optional(Type.String({ description: "Category like 'admin_instruction', 'spam_pattern', etc." }))
});

/**
 * memory_save tool: Allows the bot to persist information by appending to MEMORY.md.
 */
export function createMemorySaveTool(options: {
  config?: any;
  agentId?: string;
  workspaceDir?: string;
}): AnyAgentTool {
  return {
    label: "Memory Save",
    name: "memory_save",
    description: "Save a new pattern, decision, or instruction to your long-term memory (MEMORY.md). Use this when an admin gives a specific instruction or when you identify a new spam pattern to remember for the future.",
    parameters: MemorySaveSchema,
    execute: async (_toolCallId, params) => {
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
    }
  };
}
