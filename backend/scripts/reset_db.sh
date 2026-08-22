#!/usr/bin/env bash
#
# backend/scripts/reset_db.sh — drop all AMATSI app tables for a fresh start.
#
# Drops (in FK-safe order, with CASCADE): recommendations, weather, alerts,
# farms, users — plus their policies and indexes. auth.* (Supabase Auth) is
# NOT touched. After this, re-run scripts/migrate.sh to recreate everything.
#
# Usage:
#   ./scripts/reset_db.sh          # asks for confirmation
#   ./scripts/reset_db.sh -y       # no confirmation
#
# Connection: uses $SUPABASE_DB_URL if set, otherwise reads it from backend/.env

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

assume_yes=false
for arg in "$@"; do
    case "$arg" in
        -y|--yes) assume_yes=true ;;
        *) echo "usage: $0 [-y]" >&2; exit 64 ;;
    esac
done

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

echo "This will DROP these tables and ALL their data on:"
psql -d "$SUPABASE_DB_URL" -X -tAc \
    "SELECT current_database() || ' @ ' || COALESCE(inet_server_addr()::text, '(local socket)')"

if ! $assume_yes; then
    read -r -p "Type 'reset' to continue: " answer
    if [[ "$answer" != "reset" ]]; then
        echo "aborted."
        exit 1
    fi
fi

psql -v ON_ERROR_STOP=1 -q -1 -d "$SUPABASE_DB_URL" <<'SQL'
DROP TABLE IF EXISTS public.recommendations CASCADE;
DROP TABLE IF EXISTS public.weather         CASCADE;
DROP TABLE IF EXISTS public.alerts          CASCADE;
DROP TABLE IF EXISTS public.farms           CASCADE;
DROP TABLE IF EXISTS public.users           CASCADE;
SQL

echo "done — all app tables dropped. Run ./scripts/migrate.sh to rebuild."
