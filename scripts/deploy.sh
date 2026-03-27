#!/bin/bash
set -e

echo "=== Starting deployment ==="
cd ~/apmclaw-dev

# Git pull
git fetch origin dev
git reset --hard origin/dev

# .env 생성
cat > .env << EOF
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
AWS_BEARER_TOKEN_BEDROCK=${AWS_BEARER_TOKEN_BEDROCK}
AWS_REGION=us-east-1
BRAVE_SEARCH_API_KEY=${BRAVE_SEARCH_API_KEY}
TELEGRAM_CHAT_IDS_FORWARD_SPAM=${TELEGRAM_CHAT_IDS_FORWARD_SPAM}
EOF

# config/apmclaw.json 생성
mkdir -p config
IFS='  ,' read -ra CHAT_IDS <<< "${TELEGRAM_CHAT_IDS_DEV}"
GROUPS_JSON=""
for chat_id in "${CHAT_IDS[@]}"; do
  chat_id=$(echo "$chat_id" | xargs)
  if [ -n "$GROUPS_JSON" ]; then
    GROUPS_JSON+=","
  fi
  GROUPS_JSON+="\"$chat_id\": {\"requireMention\": false, \"enabled\": true}"
done

cat > config/apmclaw.json << CONFIGEOF
{
  "meta": {
    "lastTouchedVersion": "2026.3.3",
    "lastTouchedAt": "2026-03-15T00:00:00.000Z"
  },
  "models": {
    "mode": "replace",
    "bedrockDiscovery": {
      "enabled": true,
      "region": "us-east-1",
      "providerFilter": ["anthropic"],
      "refreshInterval": 3600,
      "defaultContextWindow": 200000,
      "defaultMaxTokens": 4096
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "amazon-bedrock/us.anthropic.claude-sonnet-4-6",
        "fallbacks": []
      },
      "compaction": {
        "mode": "safeguard"
      }
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "${TELEGRAM_BOT_TOKEN}",
      "groups": {
        $GROUPS_JSON
      },
      "groupPolicy": "open",
      "streaming": "off",
      "autoDeleteSystemMessages": true,
      "forwardSpamChatId": "${TELEGRAM_CHAT_IDS_FORWARD_SPAM}"
    }
  },
  "gateway": {
    "auth": {
      "mode": "token",
      "token": "7f1d4ffa9a239106a4ae4b74b77cacfdc5ddfcdfc29790d5"
    },
    "controlUi": {
      "enabled": false
    }
  }
}
CONFIGEOF

# Docker 정리 및 재시작
docker compose down || true
docker system prune -a -f
docker compose build --no-cache
docker compose up -d

sleep 5
docker logs apmclaw --tail 50
echo "✅ Deployment successful!"
