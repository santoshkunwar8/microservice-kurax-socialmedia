# 🎉 KuraXX - Complete Real-Time Chat Application

A production-ready, full-stack real-time chat application built with modern technologies.

## 📦 What You Get

### **Complete Monorepo with 3 Services:**
1. **REST API Service** - Express.js backend with TypeScript
2. **WebSocket Service** - Real-time messaging with ws library
3. **React Frontend** - Modern SPA with Vite and Tailwind CSS

### **Production-Ready Infrastructure:**
- Docker containerization for all services
- Docker Compose for local development
- PostgreSQL database with Prisma ORM
- Redis for pub/sub messaging and caching
- Firebase Cloud Storage integration
- Nginx reverse proxy for production

## 🚀 Quick Start (5 Minutes)

### Option 1: Docker (Recommended)
```bash
# Clone and setup
git clone <your-repo>
cd KuraXX
cp .env.example .env

# Run everything
docker-compose up
```
Then open **http://localhost** and register!

### Option 2: Local Development
```bash
# Install and setup
npm install
cp .env.example .env
docker-compose up postgres redis

# Setup database
npx prisma db push

# Start services
npm run dev
```
Then open **http://localhost:5173**

## 📁 Project Structure

```
KuraXX/
├── apps/
│   ├── api-service/          Express REST API (Port 3001)
│   │   ├── src/
│   │   │   ├── config/       Configuration management
│   │   │   ├── routes/       API endpoints (ts-rest)
│   │   │   ├── services/     Business logic
│   │   │   ├── middlewares/  Auth & error handling
│   │   │   ├── utils/        Helpers & utilities
│   │   │   └── index.ts      Express server
│   │   └── prisma/           Database schema
│   │
│   ├── ws-service/           WebSocket Server (Port 3002)
│   │   ├── src/
│   │   │   ├── config/       Redis config
│   │   │   ├── ws/           WebSocket handlers
│   │   │   ├── redis/        Pub/Sub handlers
│   │   │   ├── utils/        JWT & helpers
│   │   │   └── index.ts      WS server
│   │
│   └── web/                  React Frontend (Port 5173/80)
│       ├── src/
│       │   ├── pages/        Login & Chat pages
│       │   ├── components/   UI components
│       │   ├── services/     API client
│       │   ├── hooks/        WebSocket hook
│       │   ├── store.ts      Zustand state
│       │   └── main.tsx      Entry point
│       └── nginx.conf        Production config
│
├── libs/
│   └── shared/               Shared types & contracts
│       ├── types/            TypeScript interfaces
│       ├── constants/        App constants
│       └── contracts/        API contracts
│
├── docker-compose.yml        Development infrastructure
├── QUICKSTART.md             5-minute setup guide
├── DEPLOYMENT.md             Production guide
├── IMPLEMENTATION.md         What was built
└── README.md                 Full documentation
```

## ✨ Features

### Authentication & Users
- ✅ Register new accounts
- ✅ Login with email/password
- ✅ JWT token with auto-refresh
- ✅ User profiles
- ✅ Online/offline status

### Real-Time Chat
- ✅ Create/join chat rooms
- ✅ Send/receive messages instantly
- ✅ Typing indicators
- ✅ Message history
- ✅ Edit/delete messages
- ✅ Message attachments

### Room Management
- ✅ Direct messages
- ✅ Group chat rooms
- ✅ Channel support
- ✅ Member roles (Owner/Admin/Member)
- ✅ Room settings

### File Uploads
- ✅ Upload files to Firebase Cloud Storage
- ✅ Generate signed URLs
- ✅ File metadata tracking
- ✅ Support for documents, images, etc.

### Real-Time Sync
- ✅ Redis Pub/Sub for message broadcasting
- ✅ Connection pooling
- ✅ Presence sync
- ✅ Typing indicators
- ✅ Automatic reconnection

## 🛠️ Technology Stack

### Frontend
- **React** 18 - UI library
- **Vite** 5 - Build tool
- **TypeScript** - Type safety
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **WebSocket** - Real-time communication

### Backend
- **Node.js** - Runtime
- **Express** 4 - Web framework
- **TypeScript** - Type safety
- **ts-rest** - Type-safe API contracts
- **Prisma** 5 - ORM
- **PostgreSQL** 16 - Database
- **Redis** 7 - Message broker
- **Firebase Admin** - Cloud storage

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Web server/proxy
- **NX** - Monorepo management

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| **QUICKSTART.md** | Get running in 5 minutes |
| **DEPLOYMENT.md** | Production setup & deployment |
| **IMPLEMENTATION.md** | Technical implementation details |
| **README.md** | Architecture & API docs |

## 🎯 Common Commands

```bash
# Development
npm run dev                 # Start all services
npm run api:dev           # API only
npm run ws:dev            # WebSocket only
npm run web:dev           # Frontend only

# Database
npx prisma studio        # Browse database UI
npx prisma db push       # Apply migrations
npx prisma db seed       # Seed sample data

# Docker
docker-compose up        # Start all containers
docker-compose logs      # View logs
docker-compose down      # Stop containers

# Build
npm run build            # Build all apps
npm run build -- web     # Build just frontend

# Lint & Format
npm run lint             # Run linter
npm run format           # Format code
```

## 🔐 Security Features

- ✅ JWT authentication with expiry
- ✅ Refresh token rotation
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Input validation with Zod
- ✅ Secure WebSocket connections
- ✅ Signed URLs for file access

## 📊 Database Schema

### Users
- User accounts with profiles
- Online/offline status
- Avatar support

### Rooms
- Direct messages
- Group chats
- Channels

### Messages
- Text content
- File attachments
- Edit/delete history
- Timestamps

### Relationships
- Room members with roles
- Message read receipts (optional)
- File metadata

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Rooms
- `GET /rooms` - List rooms
- `POST /rooms` - Create room
- `GET /rooms/:id/messages` - Get history
- `PUT /rooms/:id` - Update room
- `DELETE /rooms/:id` - Delete room

### Messages
- `POST /messages` - Send message
- `PUT /messages/:id` - Edit message
- `DELETE /messages/:id` - Delete message

### Users
- `GET /users/me` - Current user
- `PUT /users/me` - Update profile
- `GET /users/search?q=...` - Search users

### Upload
- `POST /upload` - Upload file
- `DELETE /upload/:id` - Delete file

## 🔌 WebSocket Events

### Client → Server
- `authenticate` - Authenticate connection
- `room:join` - Join room
- `room:leave` - Leave room
- `message:new` - Send message
- `typing:start` - Start typing
- `typing:stop` - Stop typing

### Server → Client
- `authenticated` - Auth successful
- `message:saved` - Message saved
- `message:deleted` - Message deleted
- `user:online` - User came online
- `user:offline` - User went offline
- `typing:start` - User typing
- `typing:stop` - User stopped typing

## 📈 Performance

- ✅ Connection pooling
- ✅ Redis caching
- ✅ Message pagination
- ✅ Gzip compression
- ✅ Database indexing
- ✅ WebSocket heartbeat
- ✅ Auto-reconnection

## 🚢 Deployment Options

### Development
```bash
npm run dev  # All services with hot reload
```

### Docker Development
```bash
docker-compose up postgres redis  # Databases only
npm run dev                        # Services locally
```

### Full Docker (Production)
```bash
docker-compose build
docker-compose up -d
```

### Kubernetes (Advanced)
- Helm charts ready
- Horizontal scaling
- Load balancing

## 📝 Environment Variables

Essential variables (in `.env`):
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/kuraxx_chat

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secret-key-min-32-chars
NODE_ENV=development

# Firebase (optional)
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=your-key
FIREBASE_CLIENT_EMAIL=your-email
FIREBASE_STORAGE_BUCKET=your-bucket
```

Full reference in `.env.example`

## ✅ Testing the App

1. **Register two accounts:**
   - Email: `user1@test.com`, Password: `pass123`
   - Email: `user2@test.com`, Password: `pass123`

2. **Create a room:**
   - Click "Create Room"
   - Add both users

3. **Send messages:**
   - Type message in both accounts
   - See typing indicators
   - Messages appear instantly

4. **Upload files:**
   - Click attach button
   - Select a file
   - See upload progress

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Change port in `docker-compose.yml` |
| Database connection error | Check DATABASE_URL in `.env` |
| WebSocket connection fails | Verify WS_PORT is 3002 |
| File upload fails | Configure Firebase credentials |

See **DEPLOYMENT.md** for detailed troubleshooting.

## 📞 Support

- Check **QUICKSTART.md** for fast setup
- Read **DEPLOYMENT.md** for production
- See **README.md** for architecture details
- Review `.env.example` for configuration

## 📄 License

This project is production-ready and fully documented for immediate deployment.

## 🎯 Next Steps

1. **Setup:** Follow QUICKSTART.md
2. **Configure:** Edit .env with your credentials
3. **Run:** `docker-compose up` or `npm run dev`
4. **Test:** Register and start chatting
5. **Deploy:** Use DEPLOYMENT.md for production

---

**Happy Chatting! 🚀**

Built with ❤️ using TypeScript, React, Node.js, and PostgreSQL
