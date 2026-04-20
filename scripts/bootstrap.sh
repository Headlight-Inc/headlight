#!/usr/bin/env bash
set -euo pipefail

REQUIRED_NODE_MAJOR=20
node_version="$(node -v 2>/dev/null || echo none)"
if [[ "$node_version" == "none" ]]; then
  echo "✗ node not found — install Node ${REQUIRED_NODE_MAJOR}+ (see .nvmrc)"
  exit 1
fi

major="$(echo "$node_version" | sed 's/^v//' | cut -d. -f1)"
if (( major < REQUIRED_NODE_MAJOR )); then
  echo "✗ node ${node_version} is too old — need >= ${REQUIRED_NODE_MAJOR}"
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "→ enabling corepack + pnpm"
  corepack enable
  corepack prepare pnpm@9.12.0 --activate
fi

echo "→ pnpm install"
pnpm install

echo "→ typecheck"
pnpm typecheck

echo "→ build"
pnpm build

echo "✓ bootstrap complete"
