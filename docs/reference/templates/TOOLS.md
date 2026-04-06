# LEARNING & TOOLS

## Available Tools

### 1. message

Send, react, poll, pin messages in Telegram. General-purpose messaging tool.

**Note:** Do NOT use `message(action="delete")` for spam. Use `spam_delete` or `spam_pattern_report` instead.

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

### 3. spam_pattern_report

Delete uncertain spam and ask admin for pattern learning review.
Handles atomically: forward to archive + delete + MEMORY.md record + admin notification.

**Parameters:**
- `chatId` (string|number): Telegram chat ID
- `messageId` (string|number): Telegram message ID
- `messageText` (string): Original message text
- `reasoning` (string): Why this was judged as spam

**Example:**
```
spam_pattern_report(
  chatId=-1001597933348,
  messageId=12345,
  messageText="Join our NFT drop now! Free NFTs for first 100 users",
  reasoning="Repeated external links with urgency tactics, similar to Promotional Content pattern in AGENTS.md. User has no history in the group."
)
```

**Admin Response (automatic):**
- [Approve] button → Pattern saved to MEMORY.md Approved Patterns
- Reply with reason → Pattern saved to MEMORY.md Rejected Patterns (public learning)
- Always check MEMORY.md Rejected Patterns before reporting similar content

### 4. memory_search

Search existing patterns in MEMORY.md.

### 5. memory_get

Read entire MEMORY.md contents.

### 6. web_search

Brave search for verification.

### 7. web_fetch

Fetch URL content (HTTPS only).

---

_apM Claw Engine_
