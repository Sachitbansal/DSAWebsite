#!/bin/sh
set -e

# Run database migrations
echo "Running database migrations..."
npx prisma db push

echo "Starting Next.js application..."
exec node server.js
