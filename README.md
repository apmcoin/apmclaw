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

### Memory Proposal System (Under Development)

**Challenge**: How can PM-E learn spam patterns without allowing anyone to poison its memory?

**Solution**: Pull Request Pattern
```
1. PM-E detects new spam pattern
2. Creates Telegram message with inline buttons:
```

**Telegram Message (Admin-Only Buttons):**
```
┌──────────────────────────────────────────────┐
│ 🔍 [PM-E] New Spam Pattern Detected          │
│                                              │
│ Pattern: "XXX link spam"                     │
│                                              │
│ 📊 Evidence:                                 │
│ • #12345 (@spammer, 12:01)                   │
│ • #12346 (@spammer, 12:03)                   │
│ • #12347 (@spammer, 12:05)                   │
│                                              │
│ 💡 Reason:                                   │
│ 3 identical links in 5min + clickbait phrase │
│                                              │
│ [ ✅ Approve ] [ ❌ Reject ]                 │
└──────────────────────────────────────────────┘
```

```
3. Admin clicks button (Telegram API verifies admin status)
4. ✅ Approved → MEMORY.md updated
5. ❌ Rejected → Proposal deleted
```

**Why This Works:**
- PM-E can only **propose**, not directly write
- Telegram inline buttons enforce admin-only clicks
- Human reviews evidence before approval
- No LLM prompt bypass possible

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
