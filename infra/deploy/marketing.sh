#!/usr/bin/env bash
set -euo pipefail
echo "→ apps/marketing deploy"
pnpm -F @headlight/marketing build
npx wrangler pages deploy apps/marketing/dist --project-name=headlight-marketing
