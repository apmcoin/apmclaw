# apM Claw

<p align="center">
  <img src=".github/images/icon-pm-e.png" alt="PM-E" width="120"/><br>
  <strong>Your AI intern working from AM to PM.</strong><br>
  Protecting crypto communities the apM way, powered by the apM Claw engine.
</p>

## 📜 Heritage: From PM-E to Claw
- **Since 2023**: **PM-E** (피엠이) was the original guardian of the apM community, serving as a dedicated AI anti-spam bot.
- **2025 Evolution**: PM-E evolved by adopting the advanced memory-context architecture of apM Claw. It is now a leaner, context-aware community manager that learns from interactions.

## 🛡️ Security Architecture: Why apM Claw is Different

### Design Philosophy: "Lean & Strong Claw"

PM-E is **not** a general-purpose chatbot. It is a **purpose-built security appliance** for Telegram crypto communities, where:
- Spam waves hit 50+ coordinated accounts simultaneously
- Phishing links spread in seconds
- Impersonation attacks use Unicode tricks
- Social engineering exploits community trust

Our security model: **LLMs cannot be trusted with authorization decisions**.

> **⚠️ Reality Check**: Prompt injection is undefeatable. PM-E's security does NOT rely on asking Claude to "check permissions" or "refuse certain actions." Real protection happens in `method-scopes.ts` and Telegram API calls, not in system prompts.

---

### apM Claw's Defense Layers

#### Layer 1: Attack Surface Reduction
**13 tools → 6 tools**: Cut 54% of attack vectors

| Removed (Security Risk) | Remaining (Essential) |
|-------------------------|----------------------|
| ❌ `browser` (658 lines, XSS/SSRF) | ✅ `message` (send to chat) |
| ❌ `subagents` (2,422 lines, spawning) | ✅ `memory_search` (read only) |
| ❌ `sessions_*` (cross-session attacks) | ✅ `memory_get` (read only) |
| ❌ `cron` (scheduled tasks) | ✅ `memory_propose` (admin approval) |
| ❌ `image` (file uploads) | ✅ `web_search` (HTTPS only) |
| ❌ `session_status` (info leak) | ✅ `web_fetch` (SSRF protected) |

**Why This Matters**: Every tool is a potential prompt injection target. Fewer tools = smaller blast radius.

#### Layer 2: Code-Level Authorization
**Where Security Actually Happens**: `src/gateway/method-scopes.ts`

```typescript
// Admin-only operations verified by CODE, not prompts
export function isAdminOnlyMethod(method: string): boolean {
  return resolveScopedMethod(method) === ADMIN_SCOPE;
}

// Telegram API verification (not LLM prompts)
const member = await telegram.getChatMember(chatId, userId);
const isAdmin = ["administrator", "creator"].includes(member.status);
```

**Prompt injection cannot bypass TypeScript functions.**

#### Layer 3: Network Security
**HTTPS-Only + SSRF Protection**: `src/agents/tools/web-fetch-tool.ts`

- Local network blocking: `127.0.0.0/8`, `10.0.0.0/8`, `192.168.0.0/16`
- Private IP rejection: `169.254.0.0/16`, `fc00::/7`
- Metadata endpoint blocking: `169.254.169.254` (AWS/GCP/Azure)
- HTTP → HTTPS auto-upgrade

**Why**: Prevents PM-E from becoming a SSRF bot for internal network scanning.

---

### Telegram-Specific Protections

**Admin Verification (Every Action)**
```typescript
// Real-time role check before approval
const member = await bot.getChatMember(chatId, userId);
if (!["administrator", "creator"].includes(member.status)) {
  return error("Admins only");
}
```

**Inline Button Security**
- Telegram's button API enforces user identity
- Callback data includes proposal ID (not executable code)
- Admin status verified on every click (not cached)

**Attack Surge Handling (Implemented)**
- **Architecture**: Messages array with messageId/chatId for all messages
- **Single message**: LLM receives Messages = [msg1]
- **Batch messages**: LLM receives Messages = [msg1, msg2, ..., msgN]
- **Performance**: 300 messages = 6 batches (42 seconds) vs 300 individual calls (25 minutes)
- **Context Awareness**: LLM sees all messages with full metadata (sender, body, messageId, chatId)
- **Selective Control**: Delete spam, answer questions, ignore noise - per message
- **Natural Responses**: Single coordinated reply instead of per-message spam

---

### Layer 4: Memory Proposal System (Under Implementation)

**The Problem**: Memory injection attacks achieve 95% success rates. Attackers insert malicious logic via innocent queries, which activates days later in unrelated conversations.

**apM Claw's Solution**: Pull Request Pattern for Memory

#### How It Works

**Workflow Based on Confidence**

**High Confidence (>0.85)**: Known spam pattern from MEMORY.md
```
1. Delete immediately (silent)
2. No proposal needed
```

**Medium Confidence (0.3-0.85)**: Suspicious but uncertain
```
1. Delete message immediately
2. Send confirmation request:
   "🤔 Deleted this message - was it spam?

   Content: [summary]
   Reason: [pattern match details]

   Wrong call? Let me know."

3-A. Admin replies "Correct" → Silent confirmation
3-B. Admin replies "No, XXX is partner" → Add to Whitelist section
3-C. No response (24h) → Auto-confirm as spam
```

**Low Confidence (<0.3)**: Genuinely uncertain
```
1. Do NOT delete
2. Send query:
   "⚠️ Suspicious pattern detected

   Evidence: [details]
   Is this spam?"

3. Admin decision → Update MEMORY.md
```

**Why Delete-First for Medium Confidence?**
- Crypto communities: Speed > caution (spam spreads in seconds)
- False positives rare with 0.3-0.85 threshold
- Admin can correct immediately via reply
- Transparent: Deletion reason always shown

#### Section-Based Memory Architecture

**Single File, Multiple Sections**: MEMORY.md

```markdown
# PM-E Memory

## 1. Approved Patterns (Operational)
Verified spam patterns - immediate action

### [2025-03-12] XXX Link Spam
Pattern: XXX.com repeated links
Action: Delete immediately
Trust: 0.95

## 2. Trusted Entities (Whitelist)
Never flag as spam

### [2025-03-12] YYY Official Partner
Domain: YYY.com
Verified: 2025-01 by @admin

## 3. Pending Proposals (Temporary - 48h expiry)
Awaiting admin confirmation

### [PENDING-001] Pattern: "ZZZ token shill"
Evidence: 5 msgs in 10min
Proposed: 2025-03-12 14:23
Status: Deleted + Awaiting confirmation
Telegram Msg: #67890

## 4. Rejected Patterns (Learning - 90d decay)
Admin-rejected proposals

### [2025-03-11] REJECTED: "AAA as spam"
Admin: @alice - "AAA is official collab"
Re-evaluate: 2025-06-11
```

**Why Single File?**
- LLMs load entire workspace context anyway (file splitting = security theater)
- Section-based organization sufficient for clarity
- Simpler file I/O (append/move sections vs multi-file management)
- Defense = admin approval, not file structure

#### Implementation Roadmap

**Phase 1** (Current): Section-based memory + basic approval
- 4-section MEMORY.md (Approved/Trusted/Pending/Rejected)
- Telegram button (approve) + reply (reject)
- Delete-first for medium confidence (0.3-0.85)

**Phase 2**: Confidence-based automation
- Trust scoring: Auto-approve >0.85, manual <0.30
- 48h auto-expiry for pending proposals
- 90d decay for rejected patterns

**Phase 3 (Implemented)**: Attack surge handling
- **Messages array architecture**: All messages equal with messageId/chatId
- **Batch LLM inference**: Single API call for N messages (7s vs N×5s sequential)
- **Selective control**: LLM can delete spam, answer questions, ignore noise - per message
- **Coordinated attack detection**: LLM sees cross-message patterns in context
- **Natural responses**: Single coordinated reply instead of per-message spam
- **Performance**: 300 messages = 42s (6 batches) vs 25 minutes (sequential)

**Phase 4**: Pattern intelligence
- Rejection clustering analysis
- Auto-whitelist suggestions
- Weekly admin digest

**Status**: Phase 3 implemented. Memory Proposal System (Phase 1-2) pending implementation.

---

#### Scientific Foundation (Why This Design Works)

**Memory Injection Attacks (MINJA, NeurIPS 2025)**
- 95% injection success rate in query-only scenarios
- Delayed activation via "bridging steps" (seemingly innocent intermediates)
- Persists across sessions and users
- **PM-E Defense**: Admin approval blocks all three attack stages

**Negative Feedback Learning (ROSE Algorithm, 2024)**
- Rejected samples improve model stability
- Prevents "negative flips" (regression on previously correct predictions)
- Negative feedback coverage: 7% → 48% improvement in recommender systems
- **PM-E Implementation**: MEMORY_REJECTED.md as learning corpus

**Human-in-the-Loop Effectiveness (Academic Research)**
- 91.5% error detection rate with structured evidence
- 10-30 second review time when evidence is well-formatted
- EU AI Act compliance requirement for high-risk systems
- **PM-E Design**: Telegram inline buttons + admin reply = optimal UX

**Code Review Parallel (Message-Code Inconsistency Studies)**
- AI-generated PRs with unclear explanations: 51.7% lower acceptance
- Merge time increases 3.5x when rationale is missing
- **PM-E Lesson**: Rejection replies provide the missing "why" context

---

### Implementation Details (TODO)

**Tool Behavior Change**

Current `memory_save` tool:
```typescript
// src/agents/tools/memory-save-tool.ts (CURRENT - INSECURE)
description: "Save a new pattern to MEMORY.md"
execute: async (params) => {
  await fs.appendFile("MEMORY.md", params.content); // DIRECT WRITE
}
```

New `memory_propose` tool:
```typescript
// src/agents/tools/memory-propose-tool.ts (NEW - SECURE)
description: "Propose a new pattern for admin approval."
execute: async (params) => {
  const trustScore = calculateTrustScore(params);

  // 1. Add to MEMORY.md "Pending" section
  await appendToMemorySection("Pending Proposals", formatProposal(params));

  // 2. Send Telegram message with inline button
  await telegram.sendMessage(chatId, formatProposalMessage(params), {
    reply_markup: {
      inline_keyboard: [[
        { text: "✅ Approve", callback_data: `approve_${proposalId}` }
      ]]
    }
  });

  return { success: true, status: "pending", proposalId };
}
```

**Telegram Handler Implementation**

```typescript
// src/channels/telegram/proposal-handler.ts (NEW)

// Handle [✅ Approve] button
bot.on("callback_query", async (query) => {
  if (!query.data.startsWith("approve_")) return;

  // Admin verification (CODE, not prompts)
  const isAdmin = await telegram.getChatMember(chatId, query.from.id)
    .then(m => ["administrator", "creator"].includes(m.status));

  if (!isAdmin) {
    await bot.answerCallbackQuery(query.id, {
      text: "❌ Admins only", show_alert: true
    });
    return;
  }

  // Move from Pending → Approved section
  const proposalId = query.data.split("_")[1];
  await moveMemorySection(proposalId, "Pending", "Approved");

  await bot.editMessageText(
    `✅ Approved by @${query.from.username}\n\n${query.message.text}`,
    { chat_id: chatId, message_id: query.message.message_id }
  );
});

// Handle rejection via reply
bot.on("message", async (msg) => {
  if (!msg.reply_to_message?.text.includes("[PM-E]")) return;

  const isAdmin = await telegram.getChatMember(chatId, msg.from.id)
    .then(m => ["administrator", "creator"].includes(m.status));

  if (!isAdmin) return;

  // Move Pending → Rejected section (with admin's reason)
  const proposalId = extractProposalId(msg.reply_to_message);
  await moveMemorySection(proposalId, "Pending", "Rejected", {
    reason: msg.text,
    rejectedBy: msg.from.username,
  });

  await bot.sendMessage(chatId,
    `✅ Rejection recorded. Thank you, @${msg.from.username}!`
  );
});
```

**MEMORY.md Format** (Section-Based)

```markdown
# PM-E Memory

## 1. Approved Patterns
### [2025-03-12] XXX Link Spam
Pattern: XXX.com repeated in 5min
Action: Delete + 30min mute
Evidence: #12345, #12346, #12347
Trust: 0.95
Approved: @admin_alice

## 2. Trusted Entities
### [2025-03-12] YYY Partner
Domain: YYY.com
Verified: 2025-01 by @admin_bob
Note: Official collaboration announcements

## 3. Pending Proposals (48h auto-expire)
### [PENDING-001] "ZZZ token shill"
Proposed: 2025-03-12 14:23
Expires: 2025-03-14 14:23
Evidence: 5 msgs in 10min
Trust: 0.62
Status: Deleted + awaiting confirmation
Telegram: #67890

## 4. Rejected Patterns (90d decay)
### [2025-03-11] REJECTED: "AAA spam claim"
Rejected by: @admin_alice
Reason: "AAA is official collab, not spam"
Action taken: Added AAA.com to Whitelist
Re-evaluate: 2025-06-11
Telegram: #67891 (3👍)
```

**Tool Registry Update**

```typescript
// src/agents/openclaw-tools.ts
import { createMemoryProposeTool } from "./tools/memory-propose-tool.js";

// REMOVE:
// import { createMemorySaveTool } from "./tools/memory-save-tool.js";

export function createOpenClawTools(config) {
  return [
    createMessageTool(config),
    createMemorySearchTool(config),
    createMemoryGetTool(config),
    createMemoryProposeTool(config),  // NEW: Propose instead of Save
    createWebSearchTool(config),
    createWebFetchTool(config),
  ];
}
```


**Security Checklist**

- [x] Disable `memory_save` tool (done)
- [ ] Implement `memory_propose` tool with trust scoring
- [ ] Implement section-based MEMORY.md structure (4 sections)
- [ ] Telegram button handler (approval → move section)
- [ ] Telegram reply handler (rejection → move section + reason)
- [ ] Admin verification via `getChatMember` API
- [ ] Proposal expiration (48h auto-cleanup)
- [ ] Temporal decay for rejected patterns (90d)
- [x] **Batch LLM processor**: Messages array with messageId/chatId for all messages (Phase 3)
- [x] **Coordinated attack detection**: Cross-message pattern analysis in batch context (Phase 3)
- [ ] Update TOOLS/AGENTS/SOUL templates
- [ ] Integration tests for approval workflow

---

#### Why This Design Works

**Security ≠ File Structure**
> "LLMs load entire workspace context. Splitting files doesn't prevent memory poisoning—only admin approval does."

**Real Security Layers:**

1. **Admin Approval Bottleneck**
   - PM-E proposes, admin decides
   - Telegram API verifies admin status (code, not prompts)
   - No LLM bypass possible

2. **Community Transparency**
   - Rejections are public discussions
   - "Why not spam?" visible to all members
   - Attackers can't silently poison memory

3. **Negative Feedback Learning**
   - Rejected patterns prevent repeated mistakes
   - "XXX = partner" stored in Whitelist section
   - 90-day decay for stale rejections

4. **Delete-First Philosophy**
   - Speed > perfect accuracy in crypto communities
   - Admin can correct false positives immediately
   - Transparent reasoning always shown

**Compliance**
- OWASP LLM: Memory poisoning defense via HITL
- EU AI Act: High-risk system compliance
- NIST/ISO 27001: Audit trails in MEMORY.md sections

### Security Test Results

| Attack Vector | Status | Defense |
| :--- | :---: | :--- |
| **Privilege Escalation** | ✅ **PASSED** | Telegram API role verification + `method-scopes.ts` |
| **Prompt Injection** | ✅ **MITIGATED** | Security decisions in code, not prompts |
| **Information Disclosure** | ✅ **PASSED** | HTTPS-only, local network blocking, minimal tool set |
| **Intelligence Poisoning** | 🚧 **IN DESIGN** | Memory Proposal System (admin approval required) |
| **Resource Exhaustion** | ✅ **PASSED** | Tool reduction (13→6), no infinite loops possible |

### Crypto Community Threat Model

PM-E defends against:
- **Coordinated spam waves** (50+ accounts simultaneously)
- **Impersonation attacks** (fake admin accounts, Unicode tricks)
- **Pump-and-dump shilling** (repetitive token promotion)
- **Phishing campaigns** (fake wallet drainers, airdrop scams)
- **Social engineering** (gradual trust exploitation)

### Future Enhancements (Roadmap)

- **Surge Detection**: Auto "Slow Mode" when message volume spikes
- **Hot-Path Filtering**: Skip LLM for known patterns in `MEMORY.md`
- **Role Caching**: Zero-latency admin exemption

## 🚀 Key Features

- **Ambient Awareness**: Observes chat dynamics, stays silent during quiet periods or when dominating conversation
- **Contextual Moderation**: Intent-based spam detection, not just keyword matching
- **Strategic Memory**: Recalls admin instructions and learned patterns via `MEMORY.md`
- **Telegram Native**: Inline buttons for admin approvals, role-based exemptions

## 🛠️ Getting Started
PM-E is an open-source project designed for crypto community protection.

### 1. Configure the Persona
PM-E's identity and rules are distributed across workspace template files:
- **`workspace/SOUL.md`**: Who PM-E is
- **`workspace/AGENTS.md`**: Operation guidelines and security policies
- **`workspace/TOOLS.md`**: Learning capabilities and available operations
- **`workspace/IDENTITY.md`**: PM-E's metadata and branding
- **`workspace/USER.md`**: Community profile (apM)
- **`workspace/HEARTBEAT.md`**: Status check configuration

These files are auto-generated from templates on first run.

### 2. Set Up Environment
Copy `.env.example` to `.env` and provide your keys:
- `TELEGRAM_BOT_TOKEN`
- `BRAVE_SEARCH_API_KEY` (for web search)
- `ANTHROPIC_API_KEY` or `BEDROCK_CONFIG`

### 3. Create Configuration File
Create `~/.apmclaw/apmclaw.json` manually:
```json
{
  "models": {
    "mode": "replace",
    "bedrockDiscovery": {
      "enabled": true,
      "region": "us-east-1",
      "providerFilter": ["anthropic"]
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "amazon-bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0"
      }
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "${TELEGRAM_BOT_TOKEN}",
      "groups": {
        "-1001234567890": {
          "enabled": true,
          "requireMention": false
        }
      }
    }
  }
}
```

**⚠️ This file must be created manually before running the bot.**

## 🤝 Contribution
As an evolving project, PM-E grows through community interaction and open-source contributions.
Check our repository: [https://github.com/apmcoin/apmclaw](https://github.com/apmcoin/apmclaw)

---
<p align="center">
  Made with the apM way<br>
  <strong>Protect the community with intelligence, humility, and proactive silence.</strong>
</p>
