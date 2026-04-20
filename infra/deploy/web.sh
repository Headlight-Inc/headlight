#!/usr/bin/env bash
set -euo pipefail
echo "→ apps/web deploy"
pnpm -F @headlight/web build
npx wrangler pages deploy apps/web/dist --project-name=headlight-web
