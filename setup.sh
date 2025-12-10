#!/bin/bash

# KuraXX - Development Setup Script
# This script automates the initial setup of the KuraXX chat application

set -e

echo "🚀 KuraXX Development Setup"
echo "=============================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+"
    exit 1
fi
echo "✅ Node.js $(node --version) found"

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm $(npm --version) found"

if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You can still develop but won't be able to use docker-compose"
else
    echo "✅ Docker found"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file (please edit with your configuration)"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📊 Checking for Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Starting PostgreSQL and Redis..."
    docker-compose up -d postgres redis
    
    echo ""
    echo "⏳ Waiting for databases to be ready..."
    sleep 5
    
    echo ""
    echo "🗄️  Setting up database..."
    npm run prisma:push || true
    
    echo ""
    echo "✅ Databases ready!"
    echo ""
    echo "🎉 Setup complete! Run: npm run dev"
else
    echo ""
    echo "⚠️  Docker not found. Please ensure PostgreSQL and Redis are running locally"
    echo "    then run: npm run prisma:push && npm run dev"
fi

echo ""
echo "📚 Next steps:"
echo "  1. Edit .env with your Firebase credentials (optional for file uploads)"
echo "  2. Run: npm run dev"
echo "  3. Open http://localhost:5173 in your browser"
echo "  4. Register a new account"
echo "  5. Start chatting!"
echo ""
