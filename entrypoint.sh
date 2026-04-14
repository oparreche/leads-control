#!/bin/sh
echo "Pushing database schema..."
npx prisma db push --skip-generate
echo "Schema pushed. Starting server..."
node server.js
