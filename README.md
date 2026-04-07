# apM Claw

<p align="center">
  <img src=".github/images/icon-pm-e.png" alt="PM-E" width="120"/><br>
  <strong>Your AI intern working from AM to PM.</strong><br>
  Protecting crypto communities the apM way, powered by the apM Claw engine.
</p>

## Heritage

**Built on OpenClaw, Rebuilt for Crypto Security**

apM Claw is an independent project inspired by [OpenClaw](https://github.com/steipete/openclaw-agent)'s memory-context architecture (MIT License). However, **less than 10% of the original codebase remains**—this is a ground-up rebuild focused on Telegram spam defense.

**What Changed:**
- **OpenClaw**: General-purpose agent framework (Slack, Discord, Web UI, Telegram)
- **apM Claw**: Telegram-only security appliance for crypto communities
- **Removed**: 80% of features (cron, browser, sessions, subagents, image generation, multi-platform support, Docker)
- **Added**: Spam forwarding, crypto-specific threat detection, code-level admin verification

**PM-E's Journey:**
- **Since 2023**: PM-E served as apM community's guardian
- **2025**: Rebuilt from scratch as a specialized security tool

## Security Architecture

### Design Philosophy: "Lean & Strong Claw"

PM-E is a **purpose-built security appliance** for Telegram crypto communities. Our core principle:

> **LLMs cannot be trusted with authorization decisions.**

Real protection happens in TypeScript code and Telegram API calls, not system prompts.

---

### Key Security Measures

**1. Attack Surface Reduction**
- **6 tools only**: `message`, `spam_delete`, `memory_search`, `memory_get`, `web_search`, `web_fetch`
- Removed: `browser`, `subagents`, `sessions_*`, `cron`, `image`, `session_status`, Docker support

**2. Code-Level Authorization**
```typescript
// Admin verification via Telegram API (not prompts)
const member = await telegram.getChatMember(chatId, userId);
const isAdmin = ["administrator", "creator"].includes(member.status);
```

**3. Spam Handling**
- Certain spam → `spam_delete` (forward to archive + delete, no memory write)
- Uncertain spam → ignored silently (admin handles manually)

> **TODO**: Spam Pattern Learning (admin-approved pattern storage) — to be redesigned during codebase compression phase

**4. Group Access Control**
- `groupPolicy: "allowlist"` — only responds in registered groups
- Spam archive chat middleware filter — prevents re-detection loop of forwarded spam
- Pre-startup message filter — ignores messages queued during downtime

**5. Network Security**
- HTTPS-only, local network blocking (`127.0.0.0/8`, `10.0.0.0/8`, `192.168.0.0/16`)
- Metadata endpoint blocking (`169.254.169.254`)

---

### Current Moderation Features

**Implemented:**
- Silent spam deletion via `spam_delete` (certain spam)
- Role-based admin exemption (code-level, not prompt-level)
- Spam archive forwarding before deletion
- Startup chat title + admin status logging

**In Development:**
- User-level sanctions (ban/mute for repeat offenders)
- Surge detection with auto "Slow Mode"

---

### Threat Model

PM-E defends crypto communities against:
- Coordinated spam waves (50+ accounts)
- Phishing campaigns (wallet drainers, airdrop scams)
- Impersonation attacks (Unicode tricks)
- Pump-and-dump shilling

---

## Deployment

### Environment

```bash
pnpm install
pnpm build
```

### Configuration

Managed via GitHub Secrets (`.env` + `config/apmclaw.json` auto-generated on deploy):

| Secret | Purpose |
|--------|---------|
| `TELEGRAM_TOKEN_*` | Bot token (separate for dev/prod) |
| `TELEGRAM_CHAT_IDS_*` | Monitored group IDs (comma-separated) |
| `TELEGRAM_CHAT_IDS_FORWARD_SPAM_*` | Spam archive chat ID |
| `AWS_BEARER_TOKEN_BEDROCK` | Bedrock API auth |
| `BRAVE_SEARCH_API_KEY` | Web search |

### Run

```bash
# Run with PM2
pm2 start dist/entry.mjs --name apmclaw -- gateway --bind lan --allow-unconfigured --port 18790
```

Auto-deployed via GitHub Actions (`deploy-dev.yml`, `deploy-prod.yml`):
- dev: push to `dev` branch → port 18789
- prod: push to `main` branch → port 18790

### Workspace Templates

PM-E's behavior is defined by templates in `docs/reference/templates/`:
- `SOUL.md` - Identity and communication style
- `AGENTS.md` - Operation guidelines and spam patterns
- `TOOLS.md` - Available capabilities

These are auto-generated to `workspace/` on first run.

## Contribution

As an evolving project, PM-E grows through community interaction and open-source contributions.
Check our repository: [https://github.com/apmcoin/apmclaw](https://github.com/apmcoin/apmclaw)

---

<p align="center">
  Made with the apM way<br>
  <strong>Protect the community with intelligence, humility, and proactive silence.</strong>
</p>
