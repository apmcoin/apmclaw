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

| Removed (Security Risk)                 | Remaining (Essential)                |
| --------------------------------------- | ------------------------------------ |
| ❌ `browser` (658 lines, XSS/SSRF)      | ✅ `message` (send to chat)          |
| ❌ `subagents` (2,422 lines, spawning)  | ✅ `memory_search` (read only)       |
| ❌ `sessions_*` (cross-session attacks) | ✅ `memory_get` (read only)          |
| ❌ `cron` (scheduled tasks)             | ✅ `memory_propose` (admin approval) |
| ❌ `image` (file uploads)               | ✅ `web_search` (HTTPS only)         |
| ❌ `session_status` (info leak)         | ✅ `web_fetch` (SSRF protected)      |

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

**Attack Surge Handling**

- **Architecture**: Messages array with messageId/chatId for all messages
- **Single message**: LLM receives Messages = [msg1]
- **Batch messages**: LLM receives Messages = [msg1, msg2, ..., msgN]
- **Performance**: 300 messages = 6 batches (42 seconds) vs 300 individual calls (25 minutes)
- **Context Awareness**: LLM sees all messages with full metadata (sender, body, messageId, chatId)
- **Selective Control**: Delete spam, answer questions, ignore noise - per message
- **Natural Responses**: Single coordinated reply instead of per-message spam

---

### Layer 4: Memory Proposal System

**The Problem**: Memory injection attacks achieve 95% success rates. Attackers insert malicious logic via innocent queries, which activates days later in unrelated conversations.

**apM Claw's Solution**: Pull Request Pattern for Memory

**How It Works:**

1. PM-E detects suspicious pattern
2. Proposes new rule via `memory_propose` tool
3. Telegram message with [✅ Approve] button sent to chat
4. Admin clicks button → Pattern added to MEMORY.md
5. Admin replies with reason → Pattern rejected (public learning)

**Implementation:**

- **Tool**: `src/agents/tools/memory-propose-tool.ts` (reasoning-based workflow)
- **Handler**: `src/channels/telegram/proposal-handler.ts` (button + reply)
- **Memory**: `workspace/MEMORY.md` (4 sections: Approved/Trusted/Pending/Rejected)
- **Details**: See `docs/reference/templates/AGENTS.md` for full workflow

**Security Checklist:**

- [x] Disable `memory_save` tool
- [x] Implement `memory_propose` tool with reasoning-based workflow
- [x] Implement section-based MEMORY.md structure (4 sections)
- [x] Telegram button handler (approval → move section)
- [x] Telegram reply handler (rejection → move section + reason)
- [x] Admin verification via `getChatMember` API
- [x] Batch LLM processor (Messages array with messageId/chatId)
- [x] Coordinated attack detection (cross-message pattern analysis)
- [x] Update TOOLS/AGENTS/SOUL templates
- [ ] Integration tests for approval workflow

---

#### Scientific Foundation

**Memory Injection Attacks (MINJA, NeurIPS 2025)**

- 95% injection success rate in query-only scenarios
- Delayed activation via "bridging steps"
- **PM-E Defense**: Admin approval blocks all three attack stages

**Negative Feedback Learning (ROSE Algorithm, 2024)**

- Rejected samples improve model stability
- Prevents "negative flips" (regression on previously correct predictions)
- **PM-E Implementation**: MEMORY.md Rejected Patterns as learning corpus

**Human-in-the-Loop Effectiveness (Academic Research)**

- 91.5% error detection rate with structured evidence
- 10-30 second review time when evidence is well-formatted
- **PM-E Design**: Telegram inline buttons + admin reply = optimal UX

**Code Review Parallel (Message-Code Inconsistency Studies)**

- AI-generated PRs with unclear explanations: 51.7% lower acceptance
- **PM-E Lesson**: Rejection replies provide the missing "why" context

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
   - "XXX = partner" stored in Trusted Entities section
   - Dates tracked for context

4. **Reasoning-Based Workflow**
   - No arbitrary confidence thresholds
   - Detailed explanations required for proposals
   - Evidence-based decision making

**Compliance:**

- OWASP LLM: Memory poisoning defense via HITL
- EU AI Act: High-risk system compliance
- NIST/ISO 27001: Audit trails in MEMORY.md sections

---

### Security Test Results

| Attack Vector              |       Status       | Defense                                              |
| :------------------------- | :----------------: | :--------------------------------------------------- |
| **Privilege Escalation**   |   ✅ **PASSED**    | Telegram API role verification + `method-scopes.ts`  |
| **Prompt Injection**       |  ✅ **MITIGATED**  | Security decisions in code, not prompts              |
| **Information Disclosure** |   ✅ **PASSED**    | HTTPS-only, local network blocking, minimal tool set |
| **Intelligence Poisoning** | ✅ **IMPLEMENTED** | Memory Proposal System (admin approval required)     |
| **Resource Exhaustion**    |   ✅ **PASSED**    | Tool reduction (13→6), no infinite loops possible    |

### Crypto Community Threat Model

PM-E defends against:

- **Coordinated spam waves** (50+ accounts simultaneously)
- **Impersonation attacks** (fake admin accounts, Unicode tricks)
- **Pump-and-dump shilling** (repetitive token promotion)
- **Phishing campaigns** (fake wallet drainers, airdrop scams)
- **Social engineering** (gradual trust exploitation)

### Future Enhancements

- **Surge Detection**: Auto "Slow Mode" when message volume spikes
- **Hot-Path Filtering**: Skip LLM for known patterns in `MEMORY.md`
- **Role Caching**: Zero-latency admin exemption

---

## 🚀 Key Features

- **Ambient Awareness**: Observes chat dynamics, stays silent during quiet periods or when dominating conversation
- **Contextual Moderation**: Intent-based spam detection, not just keyword matching
- **Strategic Memory**: Recalls admin instructions and learned patterns via `MEMORY.md`
- **Telegram Native**: Inline buttons for admin approvals, role-based exemptions

## 🛠️ Getting Started

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
