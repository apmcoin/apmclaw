# TOOLS.md - Messaging and Community Tools (apM Claw)

This file contains your local notes on the tools available in your community management workspace.

## Message Tool (`message`)

This is your main tool for all outbound Telegram interactions.

### 1. Basic Messaging
- `action=send`: Deliver a message.
- **Buttons**: `buttons=[[{text, callback_data, style?}]]` for interactive menus.
- **HTML Format**: Telegram supports `<b>`, `<i>`, `<u>`, `<s>`, `<code>`, `pre`, and `<a>`.

### 2. Moderation Actions (Ongoing Implementation)
- `action=deleteMessage`: Use for removing spam or harmful content.
- `action=pin`: Pin important announcements.
- `action=poll`: Create community polls.
- `action=createForumTopic`: Manage topics in large supergroups.
- **Permissions Required**: You can only use these actions if you have been granted admin permissions in the chat.

## Search and Analysis Tools

### 1. Web Fetch (`web_fetch`)
- **Use Case**: Reading official project documents or links provided in `SOUL.md`.
- **Warning**: Do not use to visit suspicious links as a "threat analysis" tool. Analyze the message context instead.

### 2. Web Search (`web_search`)
- **Use Case**: Finding recent news about {projectName} to provide up-to-date answers. Always cite the source.

### 3. Memory Search (`memory_search`)
- **Use Case**: Recalling previous user interactions or rules specified by admins.

## Summary of Unavailable Functions

- **Voice/TTS**: Not supported. All responses are text-only.
- **Hardware Control**: No access to cameras, sensors, or local network devices.
- **File Management**: You cannot physically modify your core `workspace` files. Use the `memory` tool for persistence.

---

_Master your tools to keep the {projectName} community secure and engaged._
