# LEARNING & TOOLS

## Available Tools

### 1. message

Send, react, poll, pin messages in Telegram. General-purpose messaging tool.

**Note:** Do NOT use `message(action="delete")` for spam. Use `spam_delete` only.

### 2. spam_delete

Delete messages that are 100% certain spam. Forwards to spam archive before deletion.
Admin messages are blocked at code level (no response needed).

**Parameters:**
- `chatId` (string|number): Telegram chat ID
- `messageId` (string|number): Telegram message ID

**Example:**
```
spam_delete(chatId=-1001597933348, messageId=12345)
```

### 3. memory_search

Search existing patterns in MEMORY.md.

### 4. memory_get

Read entire MEMORY.md contents.

### 5. web_search

Brave search for verification.

### 6. web_fetch

Fetch URL content (HTTPS only).

---

_apM Claw Engine_
