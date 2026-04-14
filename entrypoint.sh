#!/bin/sh
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Migrations done. Starting server..."
node server.js
