# apM Claw

<p align="center">
  <img src=".github/images/icon-pm-e.png" alt="PM-E" width="120"/><br>
  <strong>Your AI intern working from AM to PM.</strong><br>
  Protecting crypto communities the apM way, powered by the apM Claw engine.
</p>

## 📜 Heritage: From PM-E to Claw
- **Since 2023**: **PM-E** (피엠이) was the original guardian of the apM community, serving as a dedicated AI anti-spam bot.
- **2025 Evolution**: PM-E evolved by adopting the advanced memory-context architecture of apM Claw. It is now a leaner, context-aware community manager that learns from interactions.

## 🛡️ Security Architecture

### Design Philosophy: "Lean & Strong Claw"

PM-E is purpose-built for **Telegram crypto communities**, where attacks are fast, coordinated, and persistent. Our security model recognizes that **LLMs cannot be trusted with authorization decisions** — all security is enforced at the code level, not via prompts.

> **⚠️ Reality Check**: Large Language Models are fundamentally vulnerable to prompt injection. PM-E's security does NOT rely on asking the AI to "check permissions" or "refuse certain actions." Real protection happens in `method-scopes.ts`, not in system prompts.

### Telegram-Specific Protections

**Admin Verification (Code-Level)**
- Real-time role checks via Telegram API (`getChatMember`)
- System-level enforcement in `method-scopes.ts` before tool execution
- Inline button callbacks verify admin status before approval actions

**Attack Surface Reduction**
- **13 tools → 6 tools**: Removed all non-essential capabilities
- Eliminated: `browser`, `subagents`, `sessions_*`, `cron`, `image`, `session_status`
- Remaining: `message`, `memory_*`, `web_*` (core spam moderation only)

### Memory Proposal System (Design Complete, Implementation Pending)

**Challenge**: How can PM-E learn spam patterns without allowing anyone to poison its memory?

**The Problem**: LLMs are fundamentally vulnerable to memory injection attacks (MINJA, NeurIPS 2025). Attackers can insert malicious logic through seemingly harmless queries, with injection success rates exceeding 95%. Unlike prompt injection, memory poisoning is persistent—it remains dormant for days and activates in future sessions with different users.

**Solution**: Human-in-the-Loop (HITL) Pull Request Pattern

Research shows HITL approval workflows achieve 91.5% error detection rates when equipped with proper evidence context.

---

#### Three-Tier Memory Architecture

```
workspace/
├── MEMORY.md             # ✅ Approved Knowledge (Operational)
├── MEMORY_PENDING.md     # ⏳ Proposals Awaiting Review
└── MEMORY_REJECTED.md    # ❌ Rejected with Reasons (Learning Asset)
```

**Why Three Files?**
- **Defense in Depth**: Memory writes go through staging before production
- **Negative Flip Prevention**: Rejected patterns prevent regression (ROSE Algorithm, 2024)
- **Audit Trail**: Complete history of memory governance decisions
- **Temporal Decay**: Rejected patterns age out after 90 days for re-evaluation

---

#### Asymmetric Approval Workflow

**1. PM-E Detects Pattern**
PM-E observes suspicious activity and creates a proposal:

> ---
> 🔍 **[PM-E] New Spam Pattern Detected**
>
> **Pattern:** "XXX link spam"
>
> 📊 **Evidence:**
> - Message #12345 (@spammer, 12:01)
> - Message #12346 (@spammer, 12:03)
> - Message #12347 (@spammer, 12:05)
>
> 💡 **Reason:**
> 3 identical links in 5 minutes + clickbait phrases
>
> **Trust Score:** 0.72 (Medium Confidence)
>
> `[ ✅ Approve ]`
> ---

**2. Admin Reviews (Asymmetric Flow)**

✅ **Approve: Silent Button Click**
- Fast (1-click), no chat pollution
- MEMORY.md updated immediately
- Typical use: 90% of legitimate spam detection

❌ **Reject: Public Reply**
- Admin replies directly to the proposal message
- **Community learns**: "XXX is our official partner"
- **Rich context**: Natural language explanation teaches PM-E
- **Transparent governance**: Public decision-making visible to all members

**Example Rejection:**
```
@admin_alice (replying to PM-E):
"XXX is our verified partner since January 2025.
Their announcements are official collaboration, not spam.
Please whitelist XXX.com domain."

PM-E (auto-response):
"✅ Rejection recorded. XXX.com added to trusted partners.
Thank you for the clarification, @admin_alice!"
```

**3. Outcomes**

| Decision | File | Community Impact | PM-E Learning |
|----------|------|------------------|---------------|
| ✅ Approved | MEMORY.md | Silent operation | Pattern reinforced |
| ❌ Rejected | MEMORY_REJECTED.md | Public discussion | Learns "why not" + context |
| ⏱️ Expired (48h) | Deleted | None | Low-confidence patterns auto-expire |

---

#### Scientific Foundation

**Memory Injection Attacks (MINJA)**
- 95% injection success rate in query-only scenarios
- Delayed activation via "bridging steps" (logical intermediates)
- Persists across sessions and users
- **PM-E Defense**: Admin approval blocks all three attack stages

**Negative Feedback Learning**
- Rejected samples improve model stability (ROSE Algorithm)
- Prevents "negative flips" (regression on previously correct predictions)
- Recommender systems: Negative feedback coverage 7% → 48% with proper modeling
- **PM-E Implementation**: MEMORY_REJECTED.md as learning corpus

**Human-in-the-Loop Effectiveness**
- 91.5% error detection rate with structured evidence
- 10-30 second review time with proper context
- EU AI Act compliance for high-risk systems
- **PM-E Design**: Telegram inline buttons + admin reply = optimal UX

**Code Review Parallel (Message-Code Inconsistency)**
- AI-generated pull requests with unclear explanations have 51.7% lower acceptance
- Merge time increases 3.5x when rationale is missing
- **PM-E Lesson**: Rejection replies provide the missing "why" context

---

#### Advanced Features (Implementation Roadmap)

**Phase 1: Basic Approval (Current Design)**
- ✅ Approve button → MEMORY.md
- ❌ Reject reply → MEMORY_REJECTED.md
- 48-hour auto-expiration

**Phase 2: Trust Scoring**
```python
trust_score = (
    evidence_count * 0.3 +        # More evidence = higher confidence
    time_pattern_score * 0.2 +    # 5 minutes vs 5 days
    past_approval_rate * 0.3 +    # Similar proposals history
    domain_reputation * 0.2        # Whitelist/blacklist status
)
```
- Auto-approve proposals with trust_score > 0.85
- Request additional evidence for trust_score < 0.30

**Phase 3: Temporal Decay**
- Rejected patterns age out after 90 days
- Auto-suggest re-evaluation: "XXX was rejected as 'partner' on 2025-01-15. Partnership status may have changed."
- Prevents stale negative signals from blocking legitimate activity

**Phase 4: Rejection Clustering**
- Pattern analysis: "60% of rejections cite 'Official Partner'"
- Auto-suggest whitelist additions based on trends
- Weekly admin digest: "5 similar patterns rejected this week"

**Phase 5: Batch Review Dashboard**
- Group similar pending proposals
- Multi-select approve/reject
- Reduces admin burden during attack surges

---

#### Implementation Details (TODO)

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
description: "Propose a new pattern for admin approval. Creates a proposal that will be reviewed before being added to memory."
execute: async (params) => {
  // 1. Generate trust score
  const trustScore = calculateTrustScore(params);

  // 2. Create proposal in MEMORY_PENDING.md
  const proposalId = await savePendingProposal({
    pattern: params.content,
    evidence: params.evidence,
    reason: params.reason,
    trustScore: trustScore,
    timestamp: new Date(),
  });

  // 3. Send Telegram message with inline buttons
  await telegram.sendMessage(chatId, formatProposal(proposal), {
    reply_markup: {
      inline_keyboard: [[
        { text: "✅ Approve", callback_data: `approve_${proposalId}` }
      ]]
    }
  });

  // 4. Return success (proposal created, not executed)
  return {
    success: true,
    message: "Proposal sent to admins for review",
    proposalId: proposalId,
    status: "pending"
  };
}
```

**Telegram Handler Implementation**

```typescript
// src/channels/telegram/proposal-handler.ts (NEW)

// Handle [✅ Approve] button click
bot.on("callback_query", async (query) => {
  if (!query.data.startsWith("approve_")) return;

  // Verify admin status (CODE-LEVEL, NOT PROMPT)
  const isAdmin = await telegram.getChatMember(chatId, query.from.id)
    .then(member => ["administrator", "creator"].includes(member.status));

  if (!isAdmin) {
    await bot.answerCallbackQuery(query.id, {
      text: "❌ Only admins can approve proposals",
      show_alert: true
    });
    return;
  }

  // Execute proposal
  const proposalId = query.data.split("_")[1];
  const proposal = await loadPendingProposal(proposalId);

  await fs.appendFile("workspace/MEMORY.md", formatMemoryEntry(proposal));
  await deletePendingProposal(proposalId);

  // Update message
  await bot.editMessageText(
    `✅ Approved by @${query.from.username}\n\n${query.message.text}`,
    { chat_id: chatId, message_id: query.message.message_id }
  );
});

// Handle rejection via reply (NOT callback_query)
bot.on("message", async (msg) => {
  if (!msg.reply_to_message?.from?.is_bot) return;
  if (!msg.reply_to_message.text.includes("[PM-E] New")) return;

  // Verify admin status
  const isAdmin = await telegram.getChatMember(chatId, msg.from.id)
    .then(member => ["administrator", "creator"].includes(member.status));

  if (!isAdmin) return; // Silently ignore non-admin replies

  // Extract proposal from replied message
  const proposalId = extractProposalId(msg.reply_to_message);
  const proposal = await loadPendingProposal(proposalId);

  // Save to MEMORY_REJECTED.md with admin's reason
  await fs.appendFile("workspace/MEMORY_REJECTED.md", formatRejection({
    proposal: proposal,
    rejectionReason: msg.text,
    rejectedBy: msg.from.username,
    rejectedAt: new Date(),
    telegramMessageId: msg.message_id  // For public audit trail
  }));

  await deletePendingProposal(proposalId);

  // Confirm to admin
  await bot.sendMessage(chatId,
    `✅ Rejection recorded. Thank you for the clarification, @${msg.from.username}!`
  );

  // Update original proposal message
  await bot.editMessageText(
    `❌ Rejected by @${msg.from.username}\n\n${msg.reply_to_message.text}`,
    { chat_id: chatId, message_id: msg.reply_to_message.message_id }
  );
});
```

**File Format Specifications**

MEMORY_PENDING.md:
```markdown
## [PENDING-2025-03-12-001] Trust: 0.72
**Pattern**: "XXX link spam"
**Evidence**:
- #12345 (@spammer, 12:01)
- #12346 (@spammer, 12:03)
**Reason**: 3 identical links in 5min
**Proposed**: 2025-03-12 14:23:00 UTC
**Expires**: 2025-03-14 14:23:00 UTC (48h)
**Telegram Message ID**: 67890
```

MEMORY_REJECTED.md:
```markdown
## [2025-03-12 14:30] REJECTED by @admin_alice
**Proposed Pattern**: "XXX link spam"
**Evidence**:
- Message #12345 (@user1, 12:01) "Check XXX"
- Message #12346 (@user2, 12:03) "XXX great!"
**PM-E's Reason**: 3 identical links in 5min + clickbait

**Admin Rejection Reason** (@admin_alice):
> "XXX is our verified partner since January 2025.
> Their announcements are official collaboration, not spam.
> Please whitelist XXX.com domain."

**Community Context**:
- Telegram Message ID: 67891 (public thread)
- 3 reactions: 👍👍👍
- Action Taken: Added XXX.com to whitelist

**Lesson Learned**:
- XXX.com = trusted partner (verified 2025-01)
- Multiple mentions ≠ spam if official partnership
- Check partnership list before spam classification

**Re-evaluation Date**: 2025-06-12 (90 days)
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

- [ ] Remove `memory_save` tool completely
- [ ] Implement `memory_propose` tool with trust scoring
- [ ] Add Telegram inline button handler (approval)
- [ ] Add Telegram reply handler (rejection)
- [ ] Implement admin verification via `getChatMember` API
- [ ] Create MEMORY_PENDING.md file structure
- [ ] Create MEMORY_REJECTED.md file structure
- [ ] Add proposal expiration cron job (48 hours)
- [ ] Implement trust score calculator
- [ ] Add temporal decay for rejected patterns (90 days)
- [ ] Update TOOLS.md template to reflect new behavior
- [ ] Write integration tests for approval workflow
- [ ] Document in CLAUDE.md for future sessions

---

#### Why This Design Works

**Security Layer 1: Code-Level Enforcement**
- `memory_save` tool disabled—PM-E cannot write directly
- Only `memory_propose` tool available
- Telegram API verifies admin status on button clicks

**Security Layer 2: Community Transparency**
- Rejections are public—no hidden decision-making
- Users learn community policies in real-time
- Attackers cannot silently poison memory

**Security Layer 3: Learning from Mistakes**
- MEMORY_REJECTED.md prevents repeated false positives
- PM-E learns "XXX.com = trusted" without storing it as spam
- Negative signals are as valuable as positive ones

**Compliance & Trust**
- OWASP LLM security: Memory poisoning defense
- EU AI Act: HITL for high-risk decisions
- NIST/ISO 27001: Audit trails and access control
- Crypto community: Transparent moderation builds trust

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
- **Batch Analysis**: Process multiple messages per AI turn during attacks
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
