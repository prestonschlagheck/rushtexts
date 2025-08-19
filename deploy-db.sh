#!/bin/bash
echo "🗄️ Setting up database schema..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in environment"
    echo "📝 Please add your Vercel Postgres connection string to .env.local:"
    echo "DATABASE_URL=postgresql://username:password@host/database"
    exit 1
fi

echo "✅ DATABASE_URL found"
echo "�� Generating Prisma client..."
npx prisma generate

echo "🚀 Deploying database schema..."
npx prisma db push

echo "✅ Database setup complete!"
echo "🎉 Your tables are ready: Message, Inbound, OptOut"
