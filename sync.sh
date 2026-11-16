#!/usr/bin/env bash
# Copy the theme files into an app. Usage: ./sync.sh <app-dir> <css-dest> [js-dest]
# Example: ./sync.sh ~/repos/budget src/app/terminal.css public/terminal-keys.js
# Apps keep a copy (no runtime dependency, works with any build). Re-run to update.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
app="${1:?app dir}"; css="${2:?css dest}"; js="${3:-}"
mkdir -p "$app/$(dirname "$css")"
{ echo "/* Copied from terminal-theme@$(git -C "$here" rev-parse --short HEAD). Do not edit here; change the repo and re-run sync.sh. */"; cat "$here/terminal.css"; } > "$app/$css"
if [ -n "$js" ]; then
  mkdir -p "$app/$(dirname "$js")"
  { echo "/* Copied from terminal-theme@$(git -C "$here" rev-parse --short HEAD). */"; cat "$here/terminal-keys.js"; } > "$app/$js"
fi
echo "synced into $app"
