# apM Claw

<p align="center">
  <img src=".github/images/icon-pm-e.png" alt="PM-E" width="120"/><br>
  <strong>Your AI intern working from AM to PM.</strong><br>
  Protecting crypto communities the apM way, powered by the apM Claw engine.
</p>

## 📜 Heritage

**Built on OpenClaw, Rebuilt for Crypto Security**

apM Claw is an independent project inspired by [OpenClaw](https://github.com/steipete/openclaw-agent)'s memory-context architecture (MIT License). However, **less than 10% of the original codebase remains**—this is a ground-up rebuild focused on Telegram spam defense.

**What Changed:**
- **OpenClaw**: General-purpose agent framework (Slack, Discord, Web UI, Telegram)
- **apM Claw**: Telegram-only security appliance for crypto communities
- **Removed**: 80% of features (cron, browser, sessions, subagents, image generation, multi-platform support)
- **Added**: Memory Proposal System, spam forwarding, crypto-specific threat detection

**PM-E's Journey:**
- **Since 2023**: PM-E (피엠이) served as apM community's guardian
- **2025**: Rebuilt from scratch as a specialized security tool

## 🛡️ Security Architecture

### Design Philosophy: "Lean & Strong Claw"

PM-E is a **purpose-built security appliance** for Telegram crypto communities. Our core principle:

> **LLMs cannot be trusted with authorization decisions.**

Real protection happens in TypeScript code (`method-scopes.ts`) and Telegram API calls, not system prompts.

---

### Key Security Measures

**1. Attack Surface Reduction**
- **13 tools → 6 tools** (54% reduction)
- Removed: `browser`, `subagents`, `sessions_*`, `cron`, `image`, `session_status`
- Kept: `message`, `memory_*` (read-only), `web_search`, `web_fetch` (SSRF-protected)

**2. Code-Level Authorization**
```typescript
// Admin verification via Telegram API (not prompts)
const member = await telegram.getChatMember(chatId, userId);
const isAdmin = ["administrator", "creator"].includes(member.status);
```

**3. Memory Proposal System**
- **Problem**: Memory injection attacks achieve 95% success
- **Solution**: Human-in-the-loop approval for all memory updates

**How It Works:**
1. PM-E detects suspicious pattern
2. Proposes new rule via `memory_propose` tool
3. Telegram message with [✅ Approve] button sent to chat
4. Admin clicks button → Pattern added to MEMORY.md
5. Admin replies with reason → Pattern rejected (public learning)

**4. Batch Processing**
- Messages array with `messageId`/`chatId` for coordinated attack detection
- 300 messages = 6 batches (42s) vs 300 individual calls (25 min)

**5. Network Security**
- HTTPS-only, local network blocking (`127.0.0.0/8`, `10.0.0.0/8`, `192.168.0.0/16`)
- Metadata endpoint blocking (`169.254.169.254`)

---

### Current Moderation Features

✅ **Implemented:**
- Silent spam deletion (message-level)
- Memory learning via admin approval
- Coordinated attack detection
- Role-based admin exemption

🚧 **In Development:**
- User-level sanctions (ban/mute for repeat offenders)
- Surge detection with auto "Slow Mode"
- Hot-path filtering for known patterns

---

### Threat Model

PM-E defends crypto communities against:
- Coordinated spam waves (50+ accounts)
- Phishing campaigns (wallet drainers, airdrop scams)
- Impersonation attacks (Unicode tricks)
- Pump-and-dump shilling

---

## 🚀 Key Features

- **Ambient Awareness**: Observes chat dynamics, stays silent when appropriate
- **Contextual Moderation**: Intent-based spam detection (not keyword matching)
- **Memory Learning**: Admin-approved pattern storage via `MEMORY.md`
- **Telegram Native**: Inline buttons for approvals, role-based exemptions
- **Batch Processing**: Handles coordinated attacks efficiently

## 🛠️ Quick Start

### 1. Environment Setup

Create `.env`:
```bash
TELEGRAM_BOT_TOKEN=your_token
BRAVE_SEARCH_API_KEY=your_key
ANTHROPIC_API_KEY=your_key  # or BEDROCK_CONFIG
```

### 2. Configuration

Create `~/.apmclaw/apmclaw.json`:
```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "amazon-bedrock/us.anthropic.claude-sonnet-4-6"
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

### 3. Workspace Templates

PM-E's behavior is defined by templates in `docs/reference/templates/`:
- `SOUL.md` - Identity and communication style
- `AGENTS.md` - Operation guidelines and spam patterns
- `TOOLS.md` - Available capabilities

These are auto-generated to `workspace/` on first run.

## 🤝 Contribution

As an evolving project, PM-E grows through community interaction and open-source contributions.
Check our repository: [https://github.com/apmcoin/apmclaw](https://github.com/apmcoin/apmclaw)

---

<p align="center">
  Made with the apM way<br>
  <strong>Protect the community with intelligence, humility, and proactive silence.</strong>
</p>
