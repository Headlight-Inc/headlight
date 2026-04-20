#!/usr/bin/env bash
set -euo pipefail
for worker in bridge crawl-queue mcp-server edge-fetch scheduler; do
  if [[ -d "apps/workers/$worker" ]]; then
    echo "→ deploy workers/$worker"
    (cd "apps/workers/$worker" && npx wrangler deploy)
  fi
done
