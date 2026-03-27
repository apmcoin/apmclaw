import fs from "node:fs/promises";
import path from "node:path";
import { Type } from "@sinclair/typebox";
import { resolveWorkspaceRoot } from "../workspace-dir.js";
import type { AnyAgentTool } from "./common.js";
import { jsonResult, readStringParam } from "./common.js";

const MemoryProposeSchema = Type.Object({
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
}): AnyAgentTool {
  return {
    label: "Memory Propose",
    name: "memory_propose",
    description:
      "Propose a single message or spam pattern for admin approval. MANDATORY for uncertain messages (apM meme vs spam, partner content vs promotion). Use actionTaken='preserved' when uncertain, 'deleted' when confirming new spam. Admins review via Telegram (button=approve, reply=reject). Do NOT use for patterns already in AGENTS.md or MEMORY.md Approved Patterns - just delete those immediately.",
    parameters: MemoryProposeSchema,
    execute: async (_toolCallId, params) => {
      const pattern = readStringParam(params, "pattern", { required: true });
      const evidence = params.evidence as string[];
      const actionTaken = readStringParam(params, "actionTaken", { required: true }) as
        | "deleted"
        | "preserved";
      const reasoning = readStringParam(params, "reasoning", { required: true });

      // Validate evidence array
      if (!Array.isArray(evidence) || evidence.length < 1 || evidence.length > 5) {
        return jsonResult({
          success: false,
          error: "Evidence must be an array of 1-5 message examples",
        });
      }

      const workspaceDir = resolveWorkspaceRoot(options.workspaceDir);
      const memoryFilePath = path.join(workspaceDir, "MEMORY.md");

      // Generate proposal ID (timestamp-based)
      const proposalId = `PENDING-${Date.now()}`;
      const timestamp = new Date().toISOString().split(".")[0].replace("T", " ");

      // Format proposal for MEMORY.md
      const proposal = `
### [${proposalId}] ${pattern}
Proposed: ${timestamp}
Action Taken: ${actionTaken}
Reasoning: ${reasoning}
Evidence:
${evidence.map((e, i) => `${i + 1}. ${e}`).join("\n")}
Status: Awaiting admin review

`;

      try {
        // Read current MEMORY.md content
        let content = "";
        try {
          content = await fs.readFile(memoryFilePath, "utf-8");
        } catch (err) {
          // File doesn't exist yet, will be created
          content = "";
        }

        // Find the "Pending Proposals" section
        const pendingSection = "## 3. Pending Proposals";
        const pendingSectionIndex = content.indexOf(pendingSection);

        if (pendingSectionIndex === -1) {
          return jsonResult({
            success: false,
            error: "MEMORY.md is missing '## 3. Pending Proposals' section. Initialize it first.",
          });
        }

        // Find the next section (## 4.) or end of file
        const nextSectionIndex = content.indexOf("\n## 4.", pendingSectionIndex);
        const insertPosition = nextSectionIndex === -1 ? content.length : nextSectionIndex;

        // Remove "_No pending proposals._" if present
        const beforeInsert = content.substring(0, insertPosition);
        const afterInsert = content.substring(insertPosition);
        const cleanedBefore = beforeInsert.replace(/\n_No pending proposals\._\s*$/m, "\n");

        // Insert proposal
        const updatedContent = cleanedBefore + proposal + afterInsert;

        // Write back to MEMORY.md
        await fs.writeFile(memoryFilePath, updatedContent, "utf-8");

        // TODO Phase 2: Send Telegram message with inline button
        // await sendTelegramProposal(proposalId, pattern, actionTaken, reasoning, evidence);

        return jsonResult({
          success: true,
          proposalId,
          status: "pending",
          message: `Proposal ${proposalId} saved to MEMORY.md Pending section. Telegram notification will be implemented in Phase 2.`,
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
