# apM Claw

<p align="center">
  <strong>Your AI intern working from AM to PM.</strong><br>
  Protecting crypto communities the apM way, powered by the claw.
</p>

<p align="center">
  <a href="README.ko.md">한국어</a> | English
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

---

> **🦞 Why We Forked OpenClaw: The Lean, Strong Claw**
>
> We fell in love with OpenClaw's **brilliant memory-context management** and **persistent session architecture**.
> But for crypto security, we needed something **leaner and meaner**.
>
> **PM-E (Since 2023)** directly protected the apM community.
> **In 2025, it met the claw** — evolved into **apM Claw** by borrowing its context power.
> The claw on a **security diet** — **kept the brain, shed the fat**.
>
> 🔐 **Leaner but stronger. Purpose-built for crypto communities.**

---

> **📚 Documentation Note**
>
> apM Claw is a **compact, hardened fork** of [OpenClaw](https://openclaw.ai) specifically for crypto community management.
> Features were reduced to minimize attack surface and prevent malicious exploitation.
>
> For complete technical documentation, see **[OpenClaw Documentation](https://docs.openclaw.ai)**.

---

## What is apM Claw?

apM Claw is a **24/7 AI-powered Telegram community manager** built for crypto and Web3 projects.

**Heritage:**
- **Since 2023**: PM-E served the apM community with AI-based spam detection
- **2025**: Rebuilt on OpenClaw's architecture, hardened for crypto security

**Why "apM"?**
AM + PM = 24/7. Your community never sleeps, and neither does apM Claw.

**Why OpenClaw?**
Crypto communities face sophisticated phishing attacks requiring **full context analysis**. OpenClaw's architecture enables:
- Multi-turn conversation understanding
- Admin permission verification
- Context-aware threat detection
- Behavioral pattern analysis

**Built on OpenClaw:**
Forked with respect from [OpenClaw](https://openclaw.ai). Inherits the robust gateway architecture, focuses on Telegram community security.

---

## Features

### Community Management (Inherited from PM-E)
- **AI-Based Anti-Spam** - Full context analysis to detect sophisticated scams
- **Admin Permission Control** - Verifies admin status before allowing moderation actions
- **Auto-Greetings** - Welcome new members with customizable messages
- **Smart Auto-Reply** - Answer FAQs from project documentation (whitepaper, website, Medium, etc.)
- **Multi-Language** - Separate handling for Korean/English channels

### Powered by OpenClaw Framework
- **Telegram + Discord Only** - Focused on crypto community platforms
- **Context Architecture Kept** - OpenClaw's memory & session management preserved
- **Routing Simplified** - Single agent per instance (vs complex multi-agent routing)
- **30+ LLM Providers** - OpenAI, Anthropic, Gemini, local models, etc.
- **Persistent Sessions** - Context maintained across conversations per chat room

📚 **Learn more**: [OpenClaw Concepts](https://docs.openclaw.ai/concepts) | [Agent System](https://docs.openclaw.ai/concepts/agent)

### Crypto-Friendly (Optimized for Web3)
- **Browser Automation** - Monitor communities, capture chart screenshots (limited scope for security)
- **Web Scraping** - Fetch project documentation for FAQ responses (under review for attack prevention)
- **API Integration Ready** - CoinMarketCap, CoinGecko support
- **Fork-Friendly** - Other projects can easily customize

📚 **Learn more**: [Browser Tool](https://docs.openclaw.ai/tools/browser) | [Web Fetch](https://docs.openclaw.ai/tools/web-fetch)

---

## What's Different from OpenClaw?

| Feature | OpenClaw | apM Claw |
|---------|----------|----------|
| **Focus** | Personal AI assistant | Crypto community security manager |
| **Target** | Single-user, multi-device | Crypto community groups |
| **Channels** | 20+ platforms | Telegram + Discord only |
| **Context System** | ✅ Full architecture | ✅ **Kept** (core value) |
| **Agent Routing** | Multi-agent routing | Simplified to single agent |
| **DM Policy** | Pairing allowed | ❌ Completely blocked (group admin only) |
| **Device Control** | Voice, camera, system | ❌ Removed (security) |
| **Gateway Nodes** | Multiple nodes, remote | ❌ CLI-only, chat room focused |

### Removed Features

**For security and attack surface reduction:**
- ❌ **All channels except Telegram/Discord** - Reduces maintenance and attack vectors
- ❌ **DM access** - Prevents token-wasting attacks and phishing attempts
- ❌ **Multi-agent routing complexity** - Simplified to single agent per instance (kept context system)
- ❌ **Voice wake, phone calls, TTS** - Not needed for text-based community management
- ❌ **Camera/screen recording** - Device control removed
- ❌ **System command execution** (system.run) - Prevents arbitrary code execution
- ❌ **Canvas/A2UI desktop rendering** - Removed (desktop UI not needed for Telegram bots)
- ❌ **iOS/Android companion apps** - CLI-only deployment
- ❌ **SMS/iMessage bridging** - Outside crypto community scope
- ❌ **Multi-gateway nodes** - Single instance, CLI-focused

### Limited Features

**Under review for security hardening:**
- ⚠️ **Web fetch/search** - Limited scope to prevent malicious URL exploitation

### Kept Features (Essential for Communities)

- ✅ **Telegram + Discord** (core platforms)
- ✅ **Browser automation** (limited, monitored)
- ✅ **Memory & context architecture** (OpenClaw's core strength)
- ✅ **Persistent sessions** (conversation continuity per room)
- ✅ **Admin permission verification**
- ✅ **Plugin system** (vetted extensions only)

---

## Quick Start

### Prerequisites
- **Docker & Docker Compose** (required)
- **Linux** (recommended for production)
- Telegram Bot Token ([get from @BotFather](https://t.me/botfather))
- AI model API key (Anthropic, OpenAI, etc.)

### Installation (Docker Only)

apM Claw uses Docker for consistent, secure deployments.

```bash
# 1. Clone repository
git clone https://github.com/apmcoin/apmclaw.git
cd apmclaw

# 2. Create .env file
cp .env.example .env
# Edit .env and fill in:
# - OPENCLAW_GATEWAY_TOKEN (generate with: openssl rand -hex 32)
# - TELEGRAM_BOT_TOKEN (from @BotFather)
# - ANTHROPIC_API_KEY or OPENAI_API_KEY

# 3. Start with Docker Compose
docker compose up -d

# 4. Check logs
docker compose logs -f

# 5. Check health
curl http://localhost:18789/healthz
```

📚 **Why Docker only?**: Consistent environments, better isolation, easier deployment. No npm global installs or daemon configuration needed.

### Basic Usage

```bash
# View logs
docker compose logs -f apmclaw

# Restart service
docker compose restart apmclaw

# Stop service
docker compose down

# Rebuild after code changes
docker compose build && docker compose up -d

# CLI access (for debugging)
docker compose --profile cli run apmclaw-cli agent --message "Hello!"
```

---

## ⚠️ Security Warnings

### AI Is Not Perfect

**IMPORTANT**: AI can be fooled. For crypto communities:

1. **AI Injection Attacks** - Malicious users can attempt prompt injection to bypass filters
2. **Separate Sensitive Systems** - NEVER run apM Claw on the same instance as:
   - Wallet private keys
   - API keys with financial access
   - Token contract management
   - Critical infrastructure
3. **Use Dedicated Instances** - Run apM Claw on isolated servers
4. **Monitor Logs** - Regularly review moderation decisions
5. **Human Oversight** - AI is an assistant, not a replacement for human admins

### DM Policy

**ALL DMs are blocked by default.** apM Claw operates in **group admin mode only**.

This prevents:
- Token-wasting attacks via spam DMs
- Phishing attempts through private messages
- Unauthorized access to bot features

### Need Help?

If you're unsure about security configuration, **contact the apM team** for assistance.

---

## Configuration

Key config files:
- `~/.config/apmclaw/openclaw.json` - Main config (JSON5 format)
- `~/.config/apmclaw/AGENTS.md` - Agent memory and context
- `~/.config/apmclaw/SOUL.md` - Bot personality

📚 **Full reference**: [OpenClaw Configuration Guide](https://docs.openclaw.ai/gateway/configuration)

### Example: Telegram Security Config

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "YOUR_BOT_TOKEN",
      dmPolicy: "blocked",  // DMs completely disabled
      allowFrom: ["tg:@YourProjectAdmin"]  // Admin whitelist
    }
  },
  agents: {
    defaults: {
      model: { primary: "anthropic/claude-opus-4-6" },
      workspace: "~/.config/apmclaw/workspace"
    }
  }
}
```

### FAQ Auto-Reply Setup

apM Claw can auto-generate responses from your project documentation:

```bash
# Add your whitepaper URL
apmclaw faq add --url https://yourproject.com/whitepaper.pdf

# Add Medium articles
apmclaw faq add --url https://medium.com/@yourproject

# Add website
apmclaw faq add --url https://yourproject.com/docs
```

The AI will reference these documents when answering user questions.

---

## Telegram Setup

1. Create bot: [@BotFather](https://t.me/botfather) → `/newbot`
2. Copy bot token
3. Add bot to your group
4. **Make bot admin** (required for moderation and admin verification)
5. Add token to `.env` file: `TELEGRAM_BOT_TOKEN=your-token-here`
6. Create `config/openclaw.json` (optional, for custom settings):
   ```json5
   {
     channels: {
       telegram: {
         enabled: true,
         dmPolicy: "blocked"  // DMs disabled by default
       }
     }
   }
   ```
7. Start: `docker compose up -d`

📚 **Detailed setup**: [OpenClaw Telegram Guide](https://docs.openclaw.ai/channels/telegram)

---

## Documentation

### OpenClaw Official Docs
For comprehensive technical documentation:

- **[Getting Started](https://docs.openclaw.ai/start/getting-started)** - Installation & setup
- **[Architecture & Concepts](https://docs.openclaw.ai/concepts/architecture)** - Gateway, agents, sessions
- **[Gateway Configuration](https://docs.openclaw.ai/gateway/configuration)** - Complete config reference
- **[Channels: Telegram](https://docs.openclaw.ai/channels/telegram)** - Telegram-specific setup
- **[Tools & Skills](https://docs.openclaw.ai/tools)** - Browser, web fetch (limited in apM Claw)
- **[Security](https://docs.openclaw.ai/gateway/security)** - Security best practices
- **[Full Index](https://docs.openclaw.ai)** - Complete documentation

### apM Claw Specific Changes

**Removed** (for security):
- Multi-channel gateway (Telegram/Discord only)
- DM access (blocked completely)
- Multi-agent routing (single agent for all rooms)
- Voice, camera, system control
- Companion apps (CLI-only)
- Remote gateway nodes

**Limited** (under review):
- Web fetch/search (attack prevention)
- Live Canvas (reviewing use cases)

**Emphasized** (crypto-friendly):
- Full context analysis for sophisticated scams
- Admin permission verification
- FAQ from project documentation
- Browser automation for monitoring

---

## For Other Crypto Projects (Fork This!)

apM Claw is designed to be forked:

```bash
# 1. Fork on GitHub
# 2. Clone your fork
git clone https://github.com/your-org/apmclaw.git
cd apmclaw

# 3. Customize configuration
cp .env.example .env
# Edit .env with your tokens

# 4. Customize bot personality (optional)
mkdir -p config
# Create config/SOUL.md with your project's personality
# Create config/AGENTS.md for custom memory/context

# 5. Build and run
docker compose build
docker compose up -d

# 6. Check logs
docker compose logs -f
```

**Security checklist for forking:**
- ✅ Use dedicated, isolated server
- ✅ Keep DM policy blocked
- ✅ Verify admin permissions before moderation
- ✅ Review AI decisions regularly
- ✅ Separate from financial systems
- ✅ Change OPENCLAW_GATEWAY_TOKEN to unique value

---

## Development

```bash
# Clone
git clone https://github.com/apmcoin/apmclaw.git
cd apmclaw

# Install dependencies
pnpm install

# Build
pnpm build

# Run with Docker (recommended)
docker compose up --build

# Or run locally (for development)
./apmclaw.mjs gateway --allow-unconfigured --verbose
```

📚 **Development guide**: [OpenClaw Development](https://docs.openclaw.ai/pi-dev)

---

## Architecture

Inherits OpenClaw's **Gateway + Agent** architecture, simplified for crypto security:

- **Gateway** - CLI-only, chat room focused (no remote nodes)
- **Agent** - Single agent manages all chat rooms with separate context
- **Channels** - Telegram + Discord only
- **Extensions** - Vetted plugins only

```
┌─────────────────┐
│  Telegram Bot   │
│  (Admin Only)   │
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Gateway  │ ←─── CLI-only, no remote nodes
    └────┬─────┘
         │
    ┌────▼─────┐
    │  Agent   │ ←─── Single AI, multiple room contexts
    └────┬─────┘
         │
    ┌────▼─────┐
    │  Tools   │ ←─── Limited scope (security)
    └──────────┘
```

📚 **Learn more**: [OpenClaw Architecture](https://docs.openclaw.ai/concepts/architecture)

---

## Heritage & Upstream

**PM-E (Since 2023):**
Original Telegram chatbot serving apM community with AI-based spam detection. Built admin permission verification system to prevent unauthorized moderation and detect sophisticated phishing via full conversation context analysis.

**OpenClaw:**
Forked from [openclaw/openclaw](https://github.com/openclaw/openclaw). We maintain an upstream remote to sync improvements:

```bash
git remote add upstream https://github.com/openclaw/openclaw.git
git fetch upstream
git merge upstream/main
```

Thank you to the OpenClaw team for the incredible foundation!

---

## Contributing

We welcome:
- Bug reports & fixes
- Anti-spam improvements
- Crypto-specific attack pattern documentation
- Security hardening suggestions

**Please review our security policy before contributing.**

Open an issue or PR on [GitHub](https://github.com/apmcoin/apmclaw).

---

## License

MIT License - see [LICENSE](LICENSE)

Forked from [OpenClaw](https://github.com/openclaw/openclaw) with respect.

---

## Links

- **Website**: [apm.fashion](https://apm.fashion)
- **GitHub**: [apmcoin/apmclaw](https://github.com/apmcoin/apmclaw)
- **PM-E (Original)**: apM Community Manager (Since 2023)
- **OpenClaw**: [openclaw.ai](https://openclaw.ai) | [Docs](https://docs.openclaw.ai)
- **Security Contact**: Contact apM team for security guidance

---

<p align="center">
  Made with the apM way<br>
  From AM to PM, protecting your community<br>
  <strong>Security first, AI second</strong>
</p>
