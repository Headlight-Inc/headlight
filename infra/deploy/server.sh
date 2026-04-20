#!/usr/bin/env bash
set -euo pipefail
: "${HF_SPACE_REPO:?Set HF_SPACE_REPO=huggingface.co/spaces/<owner>/<space>}"
: "${HF_TOKEN:?Set HF_TOKEN to an HF write token}"
echo "→ apps/server deploy (HF Space)"
git -C apps/server remote set-url origin "https://user:${HF_TOKEN}@${HF_SPACE_REPO}.git" 2>/dev/null || true
git -C apps/server push origin main
