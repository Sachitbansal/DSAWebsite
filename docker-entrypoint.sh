#!/bin/sh
set -e

echo "==> Waiting for database..."
MAX_RETRIES=30
i=0
until node node_modules/prisma/build/index.js db push --skip-generate > /tmp/prisma.log 2>&1; do
  i=$((i + 1))
  if [ $i -ge $MAX_RETRIES ]; then
    echo "==> Database never became ready. Last error:"
    cat /tmp/prisma.log
    exit 1
  fi
  echo "==> DB not ready (attempt $i/$MAX_RETRIES), retrying in 2s..."
  sleep 2
done

echo "==> Database ready."
echo "==> Starting Next.js..."
exec node server.js
