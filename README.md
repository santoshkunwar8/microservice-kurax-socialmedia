# KuraXX - Real-Time Chat Application Backend

A production-ready backend architecture for a real-time chat application built with TypeScript, Node.js, Express, WebSocket, Redis Pub/Sub, PostgreSQL, and Firebase Cloud Storage.

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐
│     Clients     │     │     Clients     │
│  (Web/Mobile)   │     │  (Web/Mobile)   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │ HTTP/REST             │ WebSocket
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   API Service   │     │   WS Service    │
│    (Express)    │     │      (ws)       │
│    Port 3001    │     │    Port 3002    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────┐
│              Redis Pub/Sub              │
│            (Message Broker)             │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│   PostgreSQL    │     │ Firebase Cloud  │
│   (Database)    │     │    Storage      │
└─────────────────┘     └─────────────────┘
```

## 📁 Project Structure

```
/KuraXX
├── apps/
│   ├── api-service/          # Express REST API
│   │   ├── prisma/
│   │   │   └── schema.prisma # Database schema
│   │   └── src/
│   │       ├── config/       # Configuration files
│   │       ├── controllers/  # Route controllers
│   │       ├── middlewares/  # Express middlewares
│   │       ├── routes/       # API routes (ts-rest)
│   │       ├── services/     # Business logic
│   │       └── utils/        # Utilities
│   │
│   └── ws-service/           # WebSocket server
│       └── src/
│           ├── config/       # Configuration files
│           ├── redis/        # Redis handlers
│           ├── types/        # TypeScript types
│           ├── utils/        # Utilities
│           └── ws/           # WebSocket handlers
│
├── libs/
│   └── shared/
│       ├── contracts/        # ts-rest API contracts
│       ├── types/            # Shared TypeScript types
│       └── constants/        # Shared constants
│
├── docker-compose.yml        # Docker services
├── package.json              # Root package.json
├── nx.json                   # NX configuration
└── tsconfig.base.json        # Base TypeScript config
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x (LTS)
- Docker & Docker Compose
- npm or yarn

### 1. Clone and Install

```bash
cd KuraXX
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Important: Set JWT_SECRET and Firebase credentials
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Optional: Start with debug tools (Adminer, Redis Commander)
docker-compose --profile debug up -d
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Or push schema (for development)
npm run prisma:push

# Optional: Open Prisma Studio
npm run prisma:studio
```

### 5. Start Services

```bash
# Start both services (development)
npm run dev

# Or start individually:
npm run api:dev    # API Service on :3001
npm run ws:dev     # WS Service on :3002
```

### 6. Verify

- API Health: http://localhost:3001/health
- WS Health: http://localhost:3002/health
- Adminer (if debug): http://localhost:8080
- Redis Commander (if debug): http://localhost:8081

## 📚 API Documentation

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login with credentials |
| `/auth/logout` | POST | Logout (requires auth) |
| `/auth/refresh` | POST | Refresh access token |
| `/auth/me` | GET | Get current user |

### Rooms

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/rooms/create` | POST | Create a new room |
| `/rooms/list` | GET | List user's rooms |
| `/rooms/:id` | GET | Get room details |
| `/rooms/:id` | PATCH | Update room |
| `/rooms/:id` | DELETE | Delete room |
| `/rooms/:id/members` | GET | Get room members |
| `/rooms/:id/members` | POST | Add member |
| `/rooms/:id/members/:userId` | DELETE | Remove member |
| `/rooms/:id/join` | POST | Join a channel |
| `/rooms/:id/leave` | POST | Leave a room |

### Messages

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/messages/send` | POST | Send a message |
| `/messages/history` | GET | Get message history |
| `/messages/:id` | GET | Get message by ID |
| `/messages/:id` | PATCH | Update message |
| `/messages/:id` | DELETE | Delete message |

### File Upload

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload/signed-url` | POST | Get signed upload URL |
| `/upload/file` | POST | Upload file directly |
| `/upload/image` | POST | Upload image |
| `/upload/:fileId` | DELETE | Delete file |

## 🔌 WebSocket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `authenticate` | `{ token: string }` | Authenticate connection |
| `room:join` | `{ roomId: string }` | Join a room |
| `room:leave` | `{ roomId: string }` | Leave a room |
| `message:new` | `{ roomId, content, type, tempId? }` | Send message |
| `typing:start` | `{ roomId: string }` | Start typing indicator |
| `typing:stop` | `{ roomId: string }` | Stop typing indicator |

### Server → Client

| Event | Description |
|-------|-------------|
| `authenticated` | Authentication successful |
| `message:saved` | Message saved to database |
| `message:update` | Message was updated |
| `message:delete` | Message was deleted |
| `presence:online` | User came online |
| `presence:offline` | User went offline |
| `typing:start` | User started typing |
| `typing:stop` | User stopped typing |
| `room:join` | User joined room |
| `room:leave` | User left room |
| `error` | Error occurred |

## 📡 Redis Pub/Sub Channels

| Channel | Publisher | Description |
|---------|-----------|-------------|
| `messages:new` | WS Service | New message from client |
| `messages:saved` | API Service | Message saved to DB |
| `messages:update` | API Service | Message updated |
| `messages:delete` | API Service | Message deleted |
| `presence:online` | WS Service | User connected |
| `presence:offline` | WS Service | User disconnected |
| `typing:start` | WS Service | User typing |
| `typing:stop` | WS Service | User stopped typing |
| `room:join` | WS Service | User joined room |
| `room:leave` | WS Service | User left room |

## 🔐 Security

- JWT-based authentication with access/refresh tokens
- Password hashing with bcrypt (12 rounds)
- Input validation with Zod schemas
- CORS configuration
- Rate limiting support
- Signed URLs for file uploads

## 🔧 Configuration

All configuration is done via environment variables. See `.env.example` for all options.

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing (min 32 chars)
- `REDIS_HOST` / `REDIS_PORT` - Redis connection

### Optional Variables

- Firebase credentials for file storage
- Rate limiting configuration
- CORS origins

## 📦 Using Contracts in Frontend

The shared contracts can be used in your frontend for type-safe API calls:

```typescript
// In your frontend project
import { apiContract } from '@kuraxx/contracts';
import { initClient } from '@ts-rest/core';

const client = initClient(apiContract, {
  baseUrl: 'http://localhost:3001',
  baseHeaders: {
    Authorization: `Bearer ${token}`,
  },
});

// Type-safe API calls
const { body, status } = await client.auth.login({
  body: {
    email: 'user@example.com',
    password: 'password123',
  },
});

if (status === 200) {
  console.log(body.data.user);
}
```

## 🛠️ Development

### Adding New API Endpoints

1. Add contract in `libs/shared/contracts/src/`
2. Create service in `apps/api-service/src/services/`
3. Create route in `apps/api-service/src/routes/`
4. Register in `apps/api-service/src/routes/index.ts`

### Adding New WebSocket Events

1. Add event type in `libs/shared/types/src/index.ts`
2. Add handler in `apps/ws-service/src/ws/message-handlers.ts`
3. Add Redis handler in `apps/ws-service/src/redis/handlers.ts`

## 📝 License

MIT
