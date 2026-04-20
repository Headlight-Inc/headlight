#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-all}"
echo "→ db migrate target=$TARGET"
pnpm -F @headlight/db migrate --target="$TARGET"
