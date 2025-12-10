#!/usr/bin/env bash

# KuraXX - Quick Start Commands
# Copy and paste these commands to get started immediately

# ============================================================================
# OPTION 1: FASTEST - Full Docker (Recommended for first-time users)
# ============================================================================
echo "Option 1: Full Docker Setup (Fastest - 1 minute)"
echo "=================================================="
echo "Run these commands:"
echo ""
echo "  git clone <your-repo>"
echo "  cd KuraXX"
echo "  cp .env.example .env"
echo "  docker-compose up"
echo ""
echo "Then open: http://localhost"
echo ""

# ============================================================================
# OPTION 2: Local Development (Gives you hot reload)
# ============================================================================
echo "Option 2: Local Development Setup"
echo "=================================="
echo "Run these commands:"
echo ""
echo "  git clone <your-repo>"
echo "  cd KuraXX"
echo "  npm install"
echo "  cp .env.example .env"
echo "  docker-compose up postgres redis"
echo "  npx prisma db push"
echo "  npm run dev"
echo ""
echo "Then open:"
echo "  - Frontend: http://localhost:5173"
echo "  - API: http://localhost:3001"
echo "  - WebSocket: ws://localhost:3002"
echo ""

# ============================================================================
# OPTION 3: Automated Setup Script
# ============================================================================
echo "Option 3: Using Automated Setup"
echo "==============================="
echo "Run these commands:"
echo ""
echo "  git clone <your-repo>"
echo "  cd KuraXX"
echo "  chmod +x setup.sh"
echo "  ./setup.sh"
echo "  npm run dev"
echo ""

# ============================================================================
# USEFUL COMMANDS AFTER SETUP
# ============================================================================
echo "Useful Commands After Setup"
echo "==========================="
echo ""
echo "Development:"
echo "  npm run dev              # Start all services with hot reload"
echo "  npm run api:dev          # Start just the API"
echo "  npm run ws:dev           # Start just WebSocket"
echo "  npm run web:dev          # Start just frontend"
echo ""
echo "Database:"
echo "  npx prisma studio       # Open database UI"
echo "  npx prisma db push      # Apply schema changes"
echo "  npx prisma db seed      # Load sample data"
echo ""
echo "Docker:"
echo "  docker-compose up        # Start everything"
echo "  docker-compose down      # Stop everything"
echo "  docker-compose logs -f   # View logs"
echo "  docker-compose ps        # Check status"
echo ""
echo "Debug Tools (Docker):"
echo "  docker-compose --profile debug up"
echo "  # Access:"
echo "  #   Redis UI: http://localhost:8081"
echo "  #   PostgreSQL UI: http://localhost:8080"
echo ""

# ============================================================================
# SAMPLE CREDENTIALS FOR TESTING
# ============================================================================
echo "Sample Test Accounts"
echo "===================="
echo ""
echo "Account 1:"
echo "  Email: user1@example.com"
echo "  Password: password123"
echo ""
echo "Account 2:"
echo "  Email: user2@example.com"
echo "  Password: password123"
echo ""
echo "You can register any account on the login page."
echo ""

# ============================================================================
# CONFIGURATION
# ============================================================================
echo "Configuration"
echo "=============="
echo ""
echo "Edit .env for:"
echo "  - Database URL"
echo "  - Redis connection"
echo "  - JWT secret"
echo "  - Firebase credentials (optional)"
echo "  - CORS settings"
echo ""
echo "See .env.example for all options"
echo ""

# ============================================================================
# TROUBLESHOOTING
# ============================================================================
echo "Troubleshooting"
echo "==============="
echo ""
echo "Port already in use?"
echo "  # Find and kill process"
echo "  lsof -i :3001"
echo "  kill -9 <PID>"
echo ""
echo "Database connection error?"
echo "  # Make sure containers are running"
echo "  docker-compose ps"
echo "  docker-compose logs postgres"
echo ""
echo "WebSocket not connecting?"
echo "  # Check WebSocket service"
echo "  curl http://localhost:3002/health"
echo "  docker-compose logs ws-service"
echo ""
echo "Want a fresh start?"
echo "  docker-compose down -v"
echo "  docker system prune -a"
echo "  docker-compose build --no-cache"
echo "  docker-compose up"
echo ""

# ============================================================================
# NEXT STEPS
# ============================================================================
echo "Next Steps"
echo "=========="
echo ""
echo "1. Read QUICKSTART.md for 5-minute setup"
echo "2. Check DEPLOYMENT.md for production"
echo "3. See PROJECT_OVERVIEW.md for complete guide"
echo ""
echo "Ready to go! Choose an option above and run the commands. 🚀"
echo ""
