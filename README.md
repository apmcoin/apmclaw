# apM Claw

<p align="center">
  <img src=".github/images/icon-pm-e.png" alt="PM-E" width="120"/><br>
  <strong>Your AI intern working from AM to PM.</strong><br>
  Protecting crypto communities the apM way, powered by the claw.
</p>

---

> **🛡️ The Philosophy of apM Claw: Context-Aware Protection**
>
> Crypto communities are the primary targets of sophisticated phishing and wallet-draining attacks.
> Traditional bots fail because they only look for keywords.
> **apM Claw looks for intent.**
>
> By leveraging a **persistent context architecture**, apM Claw understands the flow of conversation.
> It distinguishes between a helpful member and a "stealth spammer" who builds trust before attacking.
>
> **Security first, AI second. Always.**

---

## Key Features

### 🦞 2nd Gen AI Anti-Spam (PM-E Legacy)
- **Deep Context Analysis**: Detects phishing by analyzing multi-turn conversations.
- **Stealth Detection**: Identifies malicious actors who pretend to be helpful before posting harmful links.
- **Autonomous Moderation**: The AI acts independently to delete threats, with reasoning logged for human review.

### 🔐 Multi-Layer Guardrails
- **Admin Verification (Physical)**: Moderation tools (Ban, Kick, Mute) verify the requester's admin status at the code level.
- **SenderIsAdmin Flag**: The AI identifies legitimate admins through a secure metadata flag, not just a name prefix.
- **Service Message Cleanup**: Automatically hides "system noise" (join/leave messages) to keep the chat clean.

### ⚡ Lean & Hardened Framework
- **Telegram Focused**: Optimized specifically for the primary platform of crypto communities.
- **Attack Surface Reduction**: Unnecessary features (DM access, voice, camera, system execution) have been physically removed.
- **Docker-Ready**: Secure, isolated deployment in minutes.

---

## Implementation Status

| Feature | Status | Note |
|---------|--------|------|
| **AI Spam Detection** | ✅ Active | Context-aware analysis is live |
| **Admin Verification** | ✅ Active | Physical code-level checks for moderation |
| **Delete Message** | ✅ Active | Standard spam removal |
| **Ban / Kick / Mute** | 🚧 Ongoing | Being refined for autonomous AI use |
| **Auto-Greetings** | ✅ Active | Customizable welcome messages |
| **FAQ (Whitepaper)** | ✅ Active | AI answers based on project docs |

---

## Quick Start (For Forking)

apM Claw is designed to be easily customized for any crypto project.

### 1. Configure the Persona
Modify the files in the `workspace/` folder to define your project's identity:
- **`SOUL.md`**: Your bot's personality and the "{projectName} Way."
- **`IDENTITY.md`**: Official links, token symbols, and contract addresses.

### 2. Set Up Environment
Copy `.env.example` to `.env` and provide your:
- `TELEGRAM_BOT_TOKEN` (from @BotFather)
- `ANTHROPIC_API_KEY` (or OpenAI/Gemini)

### 3. Deploy
```bash
docker compose up -d
```

---

## ⚠️ Safety Warning
AI is a tool, not a human replacement. **Always keep a human admin in the loop.** apM Claw is designed to be an **AI Intern**—hardworking and vigilant, but subject to oversight.

---

<p align="center">
  Made with the apM way<br>
  From AM to PM, protecting your community<br>
  <strong>Context is the ultimate shield.</strong>
</p>
