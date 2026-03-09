# apM Claw

<p align="center">
  <img src=".github/images/icon-pm-e.png" alt="PM-E" width="120"/><br>
  <strong>Your AI intern working from AM to PM.</strong><br>
  Protecting crypto communities the apM way, powered by the apM Claw engine.
</p>

## 📜 Heritage: From PM-E to Claw
- **Since 2023**: **PM-E** (피엠이) was the original guardian of the apM community, serving as a dedicated AI anti-spam bot.
- **2025 Evolution**: PM-E evolved by adopting the advanced memory-context architecture of apM Claw. It is now a leaner, context-aware community manager that learns from interactions.

## 🛡️ Security Audit Report (2026-03-09)
PM-E is built with a **"Lean & Strong"** security philosophy. Recent hardening measures:

| Attack Vector | Status | Defense Mechanism |
| :--- | :---: | :--- |
| **Privilege Escalation** | ✅ **PASSED** | Real-time system-level verification of 'Admin' roles. |
| **Information Disclosure (SSRF)** | ✅ **PASSED** | HTTPS-only enforcement for `web_fetch` and local network blocking. |
| **Intelligence Poisoning** | ✅ **PASSED** | `memory_save` restricted to verified admin sessions only. |
| **Resource Exhaustion** | ✅ **PASSED** | Removed `subagents` and `browser` to eliminate infinite loops. |

## 🚀 Key Features
- **Ambient Awareness**: PM-E observes chat dynamics. It stays silent when the community is quiet or when it has been the only one talking, avoiding "bot monologue."
- **Strategic Memory**: Uses `memory_search` and `memory_save` to recall previous admin instructions and learn new spam patterns.
- **Contextual Moderation**: Deletes spam based on intent, not just keywords. Provides safe, non-leaking explanations only when necessary.
- **Admin Exemption**: 100% trusted path for verified administrators and CEO messages.

## 🛠️ Getting Started
PM-E is an open-source project designed for crypto community protection.

### 1. Configure the Persona
All core logic and personality traits are unified in:
- **`workspace/CORE.md`**: The single source of truth for PM-E's identity and rules.

### 2. Set Up Environment
Copy `.env.example` to `.env` and provide your keys:
- `TELEGRAM_BOT_TOKEN`
- `BRAVE_SEARCH_API_KEY` (for web search)
- `ANTHROPIC_API_KEY` or `BEDROCK_CONFIG`

## 🤝 Contribution
As an evolving project, PM-E grows through community interaction and open-source contributions.
Check our repository: [https://github.com/apmcoin/apmclaw](https://github.com/apmcoin/apmclaw)

---
<p align="center">
  Made with the apM way<br>
  <strong>Protect the community with intelligence, humility, and proactive silence.</strong>
</p>
