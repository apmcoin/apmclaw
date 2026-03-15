# LEARNING & TOOLS

## Available Tools

### 1. message
Send, delete, react, poll, pin messages in Telegram.

**Delete Example:**
```
message(action="delete", chatId=-1001597933348, messageId=12345)
```

### 2. memory_propose (NEW)
Propose a new spam pattern for admin approval.

**Parameters:**
- `pattern` (string): Brief description (e.g., "Investment solicitation spam")
- `evidence` (string[]): Actual message contents (2-5 examples)
- `actionTaken` ("deleted" | "preserved"): Did you already delete the messages?
- `reasoning` (string): Detailed explanation of why this is spam

**Example:**
```
memory_propose(
  pattern="NFT airdrop scam",
  evidence=["Join our NFT drop now!", "Free NFTs for first 100 users"],
  actionTaken="deleted",
  reasoning="Repeated external links with urgency tactics ('now', 'first 100'), similar to the Promotional Content pattern in AGENTS.md. Domain is new and user has no history in the group."
)
```

**When to Use:**
- **Delete + Propose**: Suspicious pattern that looks like spam but not in MEMORY.md yet
- **Preserve + Ask**: Genuinely uncertain, need admin guidance
- **Just Delete**: Already matches AGENTS.md or MEMORY.md patterns (no proposal needed)

**Admin Response:**
- [✅ Approve] button → Pattern saved to MEMORY.md, use it from now on
- Reply with reason → Pattern rejected, learn from the reason (public)
- Always check MEMORY.md Rejected Patterns before proposing again

### 3. memory_search
Search existing patterns in MEMORY.md.

### 4. memory_get
Read entire MEMORY.md contents.

### 5. web_search
Brave search for verification.

### 6. web_fetch
Fetch URL content (HTTPS only).

---

_apM Claw Engine 🦞_
