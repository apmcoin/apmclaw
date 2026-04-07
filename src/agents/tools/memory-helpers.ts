import fs from "node:fs/promises";
import path from "node:path";
import { resolveWorkspaceRoot } from "../workspace-dir.js";

/**
 * MEMORY.md 자동 생성 템플릿
 * 섹션 번호: 1=Approved, 2=Rejected, 3=Pending
 */
export const MEMORY_MD_TEMPLATE = `# PM-E Memory System

## 1. Approved Patterns

_No approved patterns yet._

## 2. Rejected Patterns

_No rejected patterns yet._

## 3. Pending Proposals

_No pending proposals._
`;

/**
 * MEMORY.md 필수 섹션 존재 여부 검증 및 보정
 */
export function ensureMemoryMdSections(content: string): string {
  const sections = [
    { header: "## 1. Approved Patterns", placeholder: "\n_No approved patterns yet._\n" },
    { header: "## 2. Rejected Patterns", placeholder: "\n_No rejected patterns yet._\n" },
    { header: "## 3. Pending Proposals", placeholder: "\n_No pending proposals._\n" },
  ];

  for (const { header, placeholder } of sections) {
    if (!content.includes(header)) {
      content = content.trimEnd() + "\n\n" + header + placeholder;
    }
  }

  return content;
}

interface ProposalMetadata {
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  reason?: string;
}

/**
 * Extract proposal content by ID from a specific section
 */
function extractProposal(
  content: string,
  section: "Pending" | "Approved" | "Rejected",
  proposalId: string,
): string | null {
  const sectionMap = {
    Pending: "## 3. Pending Proposals",
    Approved: "## 1. Approved Patterns",
    Rejected: "## 2. Rejected Patterns",
  };

  const sectionHeader = sectionMap[section];
  const sectionStart = content.indexOf(sectionHeader);

  if (sectionStart === -1) return null;

  // Find next section or end of file
  const nextSectionRegex = /\n## \d+\./g;
  nextSectionRegex.lastIndex = sectionStart + sectionHeader.length;
  const match = nextSectionRegex.exec(content);
  const sectionEnd = match ? match.index : content.length;

  const sectionContent = content.substring(sectionStart, sectionEnd);

  // Find the proposal
  const proposalRegex = new RegExp(`### \\[${proposalId}\\].*?(?=\\n### |\\n## |$)`, "s");
  const proposalMatch = sectionContent.match(proposalRegex);

  return proposalMatch ? proposalMatch[0] : null;
}

/**
 * Remove proposal from a section
 */
function removeProposal(
  content: string,
  section: "Pending" | "Approved" | "Rejected",
  proposalId: string,
): string {
  const sectionMap = {
    Pending: "## 3. Pending Proposals",
    Approved: "## 1. Approved Patterns",
    Rejected: "## 2. Rejected Patterns",
  };

  const sectionHeader = sectionMap[section];
  const sectionStart = content.indexOf(sectionHeader);

  if (sectionStart === -1) return content;

  // Find next section or end of file
  const nextSectionRegex = /\n## \d+\./g;
  nextSectionRegex.lastIndex = sectionStart + sectionHeader.length;
  const match = nextSectionRegex.exec(content);
  const sectionEnd = match ? match.index : content.length;

  const beforeSection = content.substring(0, sectionStart);
  const sectionContent = content.substring(sectionStart, sectionEnd);
  const afterSection = content.substring(sectionEnd);

  // Remove the proposal
  const proposalRegex = new RegExp(`\n### \\[${proposalId}\\].*?(?=\\n### |\\n## |$)`, "s");
  const updatedSection = sectionContent.replace(proposalRegex, "");

  // Check if section is now empty (only header + empty placeholder)
  const hasProposals = /### \[/.test(updatedSection);
  let finalSection = updatedSection;

  if (!hasProposals) {
    // Add back empty placeholder if needed
    const emptyPlaceholder =
      section === "Pending"
        ? "\n_No pending proposals._\n"
        : section === "Approved"
          ? "\n_No patterns approved yet._\n"
          : "\n_No rejected patterns yet._\n";

    // Insert placeholder before next section marker or end
    if (finalSection.endsWith("\n---\n")) {
      finalSection = finalSection.replace(/\n---\n$/, `${emptyPlaceholder}\n---\n`);
    } else {
      finalSection = finalSection.trimEnd() + emptyPlaceholder;
    }
  }

  return beforeSection + finalSection + afterSection;
}

/**
 * Format approved or rejected proposal with metadata
 */
function formatApprovedOrRejected(proposal: string, metadata: ProposalMetadata): string {
  // Parse the proposal
  const lines = proposal.split("\n");
  const header = lines[0]; // ### [PENDING-123456] Pattern name

  // Extract pattern name and create new header
  const patternMatch = header.match(/### \[PENDING-\d+\] (.+)/);
  const patternName = patternMatch ? patternMatch[1] : "Unknown Pattern";

  const timestamp = new Date().toISOString().split(".")[0].replace("T", " ");

  if (metadata.approvedBy) {
    // Approved format
    let formatted = `### [${timestamp}] ${patternName}\n`;
    formatted += `Approved by: @${metadata.approvedBy}\n`;
    formatted += `Approved at: ${metadata.approvedAt}\n`;

    // Extract original content (Action Taken, Reasoning, Evidence)
    const actionMatch = proposal.match(/Action Taken: (.+)/);
    const reasoningMatch = proposal.match(/Reasoning: (.+)/);
    const evidenceMatch = proposal.match(/Evidence:\n([\s\S]+?)(?=\nStatus:|$)/);

    if (actionMatch) formatted += `Action Taken: ${actionMatch[1]}\n`;
    if (reasoningMatch) formatted += `Reasoning: ${reasoningMatch[1]}\n`;
    if (evidenceMatch) formatted += `Evidence:\n${evidenceMatch[1]}\n`;

    return formatted + "\n";
  } else if (metadata.rejectedBy) {
    // Rejected format
    let formatted = `### [${timestamp}] REJECTED: ${patternName}\n`;
    formatted += `Rejected by: @${metadata.rejectedBy}\n`;
    formatted += `Rejected at: ${metadata.rejectedAt}\n`;
    formatted += `Reason: "${metadata.reason}"\n`;

    // Extract original reasoning for context
    const reasoningMatch = proposal.match(/Reasoning: (.+)/);
    if (reasoningMatch) {
      formatted += `Original reasoning: ${reasoningMatch[1]}\n`;
    }

    return formatted + "\n";
  }

  return proposal;
}

/**
 * Append formatted content to a section
 */
function appendToSection(
  content: string,
  section: "Pending" | "Approved" | "Rejected",
  formattedProposal: string,
): string {
  const sectionMap = {
    Pending: "## 3. Pending Proposals",
    Approved: "## 1. Approved Patterns",
    Rejected: "## 2. Rejected Patterns",
  };

  const sectionHeader = sectionMap[section];
  const sectionStart = content.indexOf(sectionHeader);

  if (sectionStart === -1) return content;

  // Find next section or end of file
  const nextSectionRegex = /\n## \d+\./g;
  nextSectionRegex.lastIndex = sectionStart + sectionHeader.length;
  const match = nextSectionRegex.exec(content);
  const sectionEnd = match ? match.index : content.length;

  const beforeSection = content.substring(0, sectionEnd);
  const afterSection = content.substring(sectionEnd);

  // Remove empty placeholder if present
  const placeholder =
    section === "Pending"
      ? "_No pending proposals._"
      : section === "Approved"
        ? "_No patterns approved yet._"
        : "_No rejected patterns yet._";

  const cleanedBefore = beforeSection.replace(new RegExp(`\n${placeholder}\\s*$`, "m"), "\n");

  return cleanedBefore + formattedProposal + afterSection;
}

/**
 * Move a proposal from one section to another with metadata
 */
export async function moveMemorySection(
  proposalId: string,
  fromSection: "Pending" | "Approved" | "Rejected",
  toSection: "Pending" | "Approved" | "Rejected",
  metadata?: ProposalMetadata,
  workspaceDir?: string,
): Promise<void> {
  const wsDir = resolveWorkspaceRoot(workspaceDir);
  const memoryPath = path.join(wsDir, "MEMORY.md");

  // 1. Read MEMORY.md
  const content = await fs.readFile(memoryPath, "utf-8");

  // 2. Extract proposal from source section
  const proposal = extractProposal(content, fromSection, proposalId);
  if (!proposal) {
    throw new Error(`Proposal ${proposalId} not found in ${fromSection} section`);
  }

  // 3. Remove from source section
  const withoutProposal = removeProposal(content, fromSection, proposalId);

  // 4. Format with metadata
  const formatted = formatApprovedOrRejected(proposal, metadata || {});

  // 5. Add to target section
  const withNewProposal = appendToSection(withoutProposal, toSection, formatted);

  // 6. Write back
  await fs.writeFile(memoryPath, withNewProposal, "utf-8");
}

/**
 * Extract proposal ID from Telegram message text
 */
export function extractProposalId(text: string): string | null {
  const match = text.match(/ID: (PENDING-\d+)/);
  return match ? match[1] : null;
}
