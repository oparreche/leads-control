#!/bin/sh
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Running seed..."
node prisma/seed-prod.js
echo "Starting server..."
node server.js
