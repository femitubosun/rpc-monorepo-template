#!/bin/sh
set -e

echo "=== Starting deployment process ==="
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo "YES" || echo "NO")"
echo "Current directory: $(pwd)"
echo "Listing infrastructure/db:"
ls -la infrastructure/db/

echo "=== Running database migrations ==="
cd infrastructure/db
echo "Changed to: $(pwd)"
bun run deploy
MIGRATION_EXIT_CODE=$?
echo "Migration exit code: $MIGRATION_EXIT_CODE"

if [ $MIGRATION_EXIT_CODE -ne 0 ]; then
  echo "ERROR: Migrations failed with exit code $MIGRATION_EXIT_CODE"
  exit $MIGRATION_EXIT_CODE
fi

cd ../..
echo "=== Migrations completed successfully ==="

echo "=== Starting application ==="
bun --preload ./apps/api/src/tracing.ts apps/api/src/index.ts
