#!/bin/sh

user_agent="${npm_config_user_agent:-}"

if [ "$(printf '%s' "$user_agent" | grep -c 'pnpm')" -eq 0 ]; then
  echo "❌ This project requires pnpm" >&2
  echo "✅ Install: npm install -g pnpm"
  echo "✅ Usage: pnpm install"
  exit 1
fi
