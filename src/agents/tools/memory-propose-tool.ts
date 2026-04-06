import fs from "node:fs/promises";
import path from "node:path";
import { Type } from "@sinclair/typebox";
import { resolveWorkspaceRoot } from "../workspace-dir.js";
import type { AnyAgentTool } from "./common.js";
import { jsonResult, readStringParam } from "./common.js";

const MEMORY_MD_TEMPLATE = `# PM-E Memory System

## 1. Approved Patterns

_No approved patterns yet._

## 2. Rejected Patterns

_No rejected patterns yet._

## 3. Pending Proposals

_No pending proposals._

## 4. User Preferences

_No preferences set._
`;

const MemoryProposeSchema = Type.Object({
  messageId: Type.Union([Type.String(), Type.Number()], {
    description: "Telegram message ID of the suspected spam message",
  }),
  chatId: Type.Union([Type.String(), Type.Number()], {
    description: "Telegram chat ID where the message was sent",
  }),
  pattern: Type.String({
    description: "Brief description of the spam pattern (e.g., 'Investment solicitation spam')",
  }),
  evidence: Type.Array(Type.String(), {
    description: "Actual message contents (1-5 examples, use 1 for uncertain single messages)",
    minItems: 1,
    maxItems: 5,
  }),
  actionTaken: Type.Union([Type.Literal("deleted"), Type.Literal("preserved")], {
    description: "Whether the messages were already deleted or preserved",
  }),
  reasoning: Type.String({
    description:
      "Detailed explanation of why this is spam (reference AGENTS.md patterns, mention red flags)",
  }),
});

/**
 * memory_propose tool: Propose new spam patterns for admin approval.
 *
 * Part of Memory Proposal System - replaces direct memory writes with admin-reviewed proposals.
 * Proposals are saved to MEMORY.md Pending section and sent to Telegram for admin review.
 */
export function createMemoryProposeTool(options: {
  config?: any;
  agentId?: string;
  workspaceDir?: string;
  senderIsOwner?: boolean;
}): AnyAgentTool {
  return {
    label: "Memory Propose",
    name: "memory_propose",
    description:
      "Propose a single message or spam pattern for admin approval. MANDATORY for uncertain messages (apM meme vs spam, partner content vs promotion). Use actionTaken='preserved' when uncertain, 'deleted' when confirming new spam. Admins review via Telegram (button=approve, reply=reject). Do NOT use for patterns already in AGENTS.md or MEMORY.md Approved Patterns - just delete those immediately.",
    parameters: MemoryProposeSchema,
    execute: async (_toolCallId, params) => {
      // 2nd defense: admin/owner messages must never be proposed
      if (options.senderIsOwner) {
        return jsonResult({
          success: false,
          blocked: true,
          reason: "Admin messages are exempt from spam review. Do not respond about this.",
        });
      }

      const messageId = params.messageId as string | number;
      const chatId = params.chatId as string | number;
      const pattern = readStringParam(params, "pattern", { required: true });
      const evidence = params.evidence as string[];
      const actionTaken = readStringParam(params, "actionTaken", { required: true }) as
        | "deleted"
        | "preserved";
      const reasoning = readStringParam(params, "reasoning", { required: true });

      if (!Array.isArray(evidence) || evidence.length < 1 || evidence.length > 5) {
        return jsonResult({
          success: false,
          error: "Evidence must be an array of 1-5 message examples",
        });
      }

      const workspaceDir = resolveWorkspaceRoot(options.workspaceDir);
      const memoryFilePath = path.join(workspaceDir, "MEMORY.md");

      const proposalId = `PENDING-${Date.now()}`;
      const timestamp = new Date().toISOString().split(".")[0].replace("T", " ");

      const proposal = `
### [${proposalId}] ${pattern}
Proposed: ${timestamp}
Message: chatId=${chatId} messageId=${messageId}
Action Taken: ${actionTaken}
Reasoning: ${reasoning}
Evidence:
${evidence.map((e, i) => `${i + 1}. ${e}`).join("\n")}
Status: Awaiting admin review

`;

      try {
        // Read or auto-initialize MEMORY.md
        let content = "";
        try {
          content = await fs.readFile(memoryFilePath, "utf-8");
        } catch {
          // File doesn't exist — create with template
          content = MEMORY_MD_TEMPLATE;
          await fs.mkdir(path.dirname(memoryFilePath), { recursive: true });
          await fs.writeFile(memoryFilePath, content, "utf-8");
        }

        // Auto-fix missing Pending Proposals section
        const pendingSection = "## 3. Pending Proposals";
        let pendingSectionIndex = content.indexOf(pendingSection);

        if (pendingSectionIndex === -1) {
          // Section missing — append it
          const section4 = content.indexOf("## 4.");
          if (section4 !== -1) {
            content =
              content.substring(0, section4) +
              pendingSection +
              "\n\n_No pending proposals._\n\n" +
              content.substring(section4);
          } else {
            content += "\n" + pendingSection + "\n\n_No pending proposals._\n";
          }
          pendingSectionIndex = content.indexOf(pendingSection);
        }

        // Find insertion point
        const nextSectionIndex = content.indexOf("\n## 4.", pendingSectionIndex);
        const insertPosition = nextSectionIndex === -1 ? content.length : nextSectionIndex;

        const beforeInsert = content.substring(0, insertPosition);
        const afterInsert = content.substring(insertPosition);
        const cleanedBefore = beforeInsert.replace(/\n_No pending proposals\._\s*$/m, "\n");

        const updatedContent = cleanedBefore + proposal + afterInsert;
        await fs.writeFile(memoryFilePath, updatedContent, "utf-8");

        return jsonResult({
          success: true,
          proposalId,
          status: "pending",
          message: `Proposal ${proposalId} saved. Admin review pending.`,
        });
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        return jsonResult({
          success: false,
          error: `Failed to save proposal: ${error}`,
        });
      }
    },
  };
}
