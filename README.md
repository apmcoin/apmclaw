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

## 📜 Heritage: From PM-E to Claw

- **Since 2023**: **PM-E** was the original guardian of the apM community, serving as a dedicated AI anti-spam bot.
- **2025 Evolution**: PM-E met the "Claw" (OpenClaw). By adopting the advanced memory-context architecture of OpenClaw, it evolved into **apM Claw**—a leaner, more secure, and context-aware community manager.

---

## ⚖️ How is it different from OpenClaw?

apM Claw is a **hardened fork** designed specifically for high-stakes crypto Telegram groups. We performed a "Diet" of **-412,000 lines of code** to reduce the attack surface:

- **Telegram Only**: Removed 20+ other channels (Discord, Slack, iMessage, etc.) to focus on the primary platform of Web3.
- **Zero Multimedia Bloat**: Physically removed TTS (Nova), Camera, and Sensor control logic. If it can't be done via text/image analysis in a chat, it's gone.
- **Restricted Toolset**: System command execution (`system.run`) and local network access are completely purged to prevent arbitrary code execution via prompt injection.
- **Group-First Policy**: DM access is disabled by default. The bot is an "Intern" for the group, not a personal assistant.

---

## 🦞 Key Features

### 1. 2nd Gen AI Anti-Spam
- **Multi-Turn Analysis**: Detects phishing by analyzing conversation history, not just single messages.
- **Stealth Detection**: Identifies malicious actors who build reputation before sharing wallet-drainer links.
- **Autonomous Moderation**: Acts independently to delete threats, with reasoning logged for human review.

### 2. Multi-Layer Guardrails
- **Physical Admin Check**: Moderation tools (`ban`, `kick`, `mute`) verify the requester's admin status at the code level via Telegram API.
- **Contextual Awareness**: The AI recognizes admins through secure `SenderIsAdmin` flags, preventing "spoofing" attacks.
- **Service Message Cleanup**: Automatically hides "system noise" (join/leave messages) to keep the community focused.

---

## 🗺️ Roadmap & Implementation Status

| Feature | Status | Note |
|---------|--------|------|
| **AI Spam Detection** | ✅ Active | Context-aware analysis is live |
| **Admin Verification** | ✅ Active | Physical code-level checks for moderation |
| **Delete Message** | ✅ Active | Automatic spam removal based on config |
| **Ban / Kick / Mute** | 🚧 Ongoing | Refining autonomous decision logic |
| **Guidelines Hardening** | 🚧 Ongoing | Strengthening prompt-based security rules |
| **apM Members App Version** | 📅 Planned | Dedicated in-app version with **MCP (Model Context Protocol)** |

---

## 🚀 Quick Start (For Forking)

apM Claw is designed to be easily customized for any crypto project.

### 1. Configure the Persona
Modify the files in the `workspace/` folder to define your project's identity:
- **`SOUL.md`**: Your bot's personality and the "{projectName} Way."
- **`IDENTITY.md`**: Official links, token symbols, and contract addresses.

### 2. Set Up Environment
Copy `.env.example` to `.env` and provide your `TELEGRAM_BOT_TOKEN` and AI API keys.

### 3. Deploy
```bash
docker compose up -d
```

---

## ⚠️ Safety Warning
AI is an assistant, not a replacement for human admins. **Always keep a human in the loop.**

---

<p align="center">
  Made with the apM way<br>
  From AM to PM, protecting your community<br>
  <strong>Context is the ultimate shield.</strong>
</p>
