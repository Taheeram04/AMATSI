#!/usr/bin/env bash
#
# backend/scripts/migrate.sh — apply all SQL migrations to Supabase in order.
#
# Usage:
#   ./scripts/migrate.sh
#
# Connection: uses $SUPABASE_DB_URL if set, otherwise reads it from backend/.env
# Safe to re-run: every migration is written to be idempotent.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$BACKEND_DIR/migrations"

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
    ENV_FILE="$BACKEND_DIR/.env"
    if [[ -f "$ENV_FILE" ]]; then
        SUPABASE_DB_URL="$(grep -E '^SUPABASE_DB_URL=' "$ENV_FILE" | tail -n1 | cut -d= -f2- | sed "s/^['\"]//; s/['\"]$//")"
        export SUPABASE_DB_URL
    fi
fi

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
    echo "error: SUPABASE_DB_URL is not set and no $BACKEND_DIR/.env provides it" >&2
    exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
    echo "error: psql not found in PATH" >&2
    exit 1
fi

shopt -s nullglob
files=("$MIGRATIONS_DIR"/*.sql)
shopt -u nullglob

if (( ${#files[@]} == 0 )); then
    echo "no migrations found in $MIGRATIONS_DIR"
    exit 0
fi

echo "applying ${#files[@]} migration(s)..."
failed=0
for f in "${files[@]}"; do
    name="$(basename "$f")"
    printf '  %-45s ' "$name"
    if psql -v ON_ERROR_STOP=1 -q -1 -d "$SUPABASE_DB_URL" -f "$f" >/dev/null; then
        echo "ok"
    else
        echo "FAILED"
        failed=1
        break
    fi
done

if (( failed )); then
    echo "migration run aborted." >&2
    exit 1
fi

echo "all migrations applied."
