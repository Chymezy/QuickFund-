#!/bin/sh

set -e

echo "🚀 Starting QuickFund Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
./wait-for-db.sh db

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy || {
    echo "⚠️ Migration failed, trying to reset database..."
    npx prisma migrate reset --force
    npx prisma migrate deploy
}

# Create admin user if it doesn't exist
echo "👤 Creating admin user..."
node dist/scripts/create-admin.js || {
    echo "⚠️ Admin creation failed, continuing..."
}

# Start the application
echo "🎯 Starting application..."
exec npm run start:prod 