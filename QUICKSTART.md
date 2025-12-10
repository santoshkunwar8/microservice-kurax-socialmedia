# Quick Start Guide

Get KuraXX running in 5 minutes!

## Fastest Setup (Docker)

```bash
# 1. Clone and enter directory
git clone <your-repo>
cd KuraXX

# 2. Copy environment template
cp .env.example .env

# 3. Start everything
docker-compose up

# 4. Access the app
open http://localhost
```

That's it! All services are running.

---

## Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Start databases in Docker
docker-compose up postgres redis -d

# 3. Setup database
npx prisma db push

# 4. Start all services
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Services

| Service | URL | Purpose |
|---------|-----|---------|
| Web UI | http://localhost:5173 (dev) or :80 (docker) | Chat interface |
| API | http://localhost:3001 | REST API endpoints |
| WebSocket | ws://localhost:3002 | Real-time messaging |
| Redis Commander | http://localhost:8081 | Debug Redis (if profile=debug) |
| Adminer | http://localhost:8080 | Debug PostgreSQL (if profile=debug) |

---

## Login

Use any email/password combination to register:
- Email: `test@example.com`
- Password: `password123`

---

## Common Commands

```bash
# Development
npm run dev           # Start all services with hot reload

# Frontend only
npm run web:dev       # Just the React app

# Backend only
npm run api:dev       # Just the API service
npm run ws:dev        # Just the WebSocket service

# Build for production
npm run build         # Build all apps

# Database
npx prisma studio    # Open Prisma Studio to browse database
npx prisma db push   # Apply schema changes

# Docker
docker-compose up -d                  # Start in background
docker-compose logs -f                # View all logs
docker-compose down                   # Stop and remove containers
docker-compose --profile debug up -d  # Start with debug tools
```

---

## Project Structure

```
├── apps/
│   ├── api-service/     REST API (Express)
│   ├── ws-service/      WebSocket server
│   └── web/             React frontend (Vite)
├── libs/
│   └── shared/          Shared types & contracts
├── docker-compose.yml   Infrastructure setup
└── DEPLOYMENT.md        Detailed deployment guide
```

---

## Configuration

Edit `.env` to customize:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kuraxx_chat

# Redis
REDIS_URL=redis://localhost:6379

# JWT Security
JWT_SECRET=change-me-to-something-secure

# Firebase (optional)
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=your-key
FIREBASE_CLIENT_EMAIL=your-email
FIREBASE_STORAGE_BUCKET=your-bucket
```

---

## Troubleshooting

**"Connection refused" errors?**
```bash
# Make sure databases are running
docker-compose up postgres redis
```

**Port 3001/3002 already in use?**
```bash
# Kill process on port
lsof -i :3001  # Find process ID
kill -9 <PID>
```

**Need a fresh start?**
```bash
# Stop and remove everything
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

---

## Next Steps

1. **Read the [Architecture Overview](./README.md)** to understand the system
2. **Check [DEPLOYMENT.md](./DEPLOYMENT.md)** for production setup
3. **Explore the [API Documentation](./README.md#api-documentation)**
4. **Setup Firebase** for file uploads (optional)

---

Need help? Check the logs:
```bash
docker-compose logs -f
```
