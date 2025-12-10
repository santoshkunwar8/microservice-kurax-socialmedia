# Deployment Guide

## Overview

This guide covers how to run all services for KuraXX. You have three options:

1. **Development Mode** - Run services locally with hot reload
2. **Docker Development** - Run databases and services in containers
3. **Full Docker** - Complete containerized deployment

## Prerequisites

- Node.js 20+ (for development mode)
- Docker & Docker Compose 2.0+ (for Docker deployments)
- PostgreSQL 16 (if running without Docker)
- Redis 7 (if running without Docker)

## Option 1: Development Mode (Local)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # API Service
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kuraxx_chat
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-super-secret-key-change-this
   
   # Firebase
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="your-private-key"
   FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
   FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
   ```

3. **Start PostgreSQL and Redis locally:**
   ```bash
   # macOS with Homebrew
   brew services start postgresql
   brew services start redis
   
   # Or use Docker for just databases:
   docker-compose up postgres redis
   ```

4. **Create database:**
   ```bash
   npx prisma db push
   ```

5. **Run all services in development mode:**
   ```bash
   npm run dev
   ```
   
   This starts:
   - API Service: http://localhost:3001
   - WS Service: http://localhost:3002
   - Web Frontend: http://localhost:5173

## Option 2: Docker Development (Recommended)

### Setup

1. **Install dependencies (still needed for development):**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start infrastructure (PostgreSQL + Redis):**
   ```bash
   docker-compose up -d postgres redis
   ```

4. **Setup database:**
   ```bash
   npx prisma db push
   ```

5. **Run services locally (hot reload with Docker infrastructure):**
   ```bash
   npm run dev
   ```
   
   Services will connect to Docker containers:
   - API Service: http://localhost:3001
   - WS Service: http://localhost:3002
   - Web Frontend: http://localhost:5173

### Debug Tools

Access debugging tools while development databases are running:

```bash
# Start with debug tools
docker-compose --profile debug up postgres redis redis-commander adminer

# Access tools:
# - Redis Commander: http://localhost:8081
# - Adminer (PostgreSQL UI): http://localhost:8080
```

## Option 3: Full Docker Production Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 2GB+ free disk space

### Setup

1. **Clone repository:**
   ```bash
   git clone <your-repo>
   cd KuraXX
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env.docker
   ```
   
   Edit `.env.docker` with production values:
   ```env
   JWT_SECRET=your-production-secret-key-min-32-chars
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="your-private-key"
   FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
   FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
   ```

3. **Build and start containers:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

4. **Check service health:**
   ```bash
   docker-compose ps
   ```
   
   Expected output:
   ```
   CONTAINER          STATUS
   kuraxx-postgres    Up (healthy)
   kuraxx-redis       Up (healthy)
   kuraxx-api-service Up (healthy)
   kuraxx-ws-service  Up (healthy)
   kuraxx-web         Up (healthy)
   ```

5. **Access application:**
   - Web UI: http://localhost
   - API: http://localhost/api
   - WebSocket: ws://localhost/ws

### Database Migration in Docker

If you need to run migrations:

```bash
docker-compose exec api-service npx prisma migrate deploy
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-service

# WebSocket service
docker-compose logs -f ws-service
```

### Backup and Restore

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U postgres kuraxx_chat > backup.sql

# Restore PostgreSQL
docker-compose exec -T postgres psql -U postgres kuraxx_chat < backup.sql

# Backup Redis
docker-compose exec redis redis-cli BGSAVE
docker cp kuraxx-redis:/data/dump.rdb ./redis-backup.rdb

# Restore Redis
docker cp redis-backup.rdb kuraxx-redis:/data/dump.rdb
```

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Configure Firebase credentials
- [ ] Set `NODE_ENV=production`
- [ ] Use a managed database (AWS RDS, Google Cloud SQL, etc.)
- [ ] Use a managed Redis (AWS ElastiCache, Redis Cloud, etc.)
- [ ] Enable HTTPS with SSL/TLS certificates
- [ ] Setup proper logging and monitoring
- [ ] Configure backup and recovery procedures
- [ ] Setup rate limiting and security headers
- [ ] Use environment-specific configuration

## Troubleshooting

### Services fail to start

```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up
```

### Database connection issues

```bash
# Check PostgreSQL
docker-compose exec postgres psql -U postgres -d kuraxx_chat -c "SELECT 1"

# Check Redis
docker-compose exec redis redis-cli ping
```

### WebSocket connection fails

```bash
# Verify WS service is running
curl http://localhost:3002/health

# Check logs
docker-compose logs ws-service
```

### Port conflicts

If ports are already in use, modify `docker-compose.yml`:

```yaml
services:
  postgres:
    ports:
      - "5433:5432"  # Change host port
```

## Performance Tips

1. **Increase connection pools:**
   ```env
   DATABASE_URL=postgresql://user:pass@host/db?max_pool_size=20
   ```

2. **Enable Redis persistence:**
   - Already configured in docker-compose.yml with AOF

3. **Use CDN for static files:**
   - Configure in nginx.conf for web service

4. **Monitor resource usage:**
   ```bash
   docker stats
   ```

5. **Scale horizontally:**
   - Use load balancer (nginx, HAProxy)
   - Run multiple API/WS service instances
   - Use connection pooling

## Environment Variables Reference

### API Service
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection URL
- `JWT_SECRET` - Secret key for JWT signing
- `FIREBASE_*` - Firebase credentials

### WebSocket Service
- `REDIS_URL` - Redis connection URL
- `JWT_SECRET` - Must match API service

### Common
- `NODE_ENV` - "development" or "production"
- `PORT` - Service port (API: 3001, WS: 3002)

## Getting Help

For issues:
1. Check service logs: `docker-compose logs`
2. Verify configuration in `.env`
3. Ensure dependencies are running: `docker-compose ps`
4. Check health endpoints: `curl http://localhost:3001/health`
