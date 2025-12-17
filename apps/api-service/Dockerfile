# Build stage
FROM node:20 AS builder

WORKDIR /app

# Copy only the necessary files for installation
COPY package.json package-lock.json ./
COPY apps/api-service ./apps/api-service
COPY libs ./libs
COPY nx.json tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Build shared libraries first
RUN npx nx build shared-types && npx nx build shared-contracts
# Build the API service
RUN npx nx build api-service

# Runtime stage
FROM node:20

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./


# Install only production dependencies (Debian includes OpenSSL 1.1 for Prisma)
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Copy prisma folder
COPY apps/api-service/prisma ./prisma


# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy Nx dist libs to node_modules for local workspace packages
RUN mkdir -p node_modules/@kuraxx && \
  mkdir -p node_modules/@kuraxx/contracts && \
  mkdir -p node_modules/@kuraxx/types && \
  mkdir -p node_modules/@kuraxx/constants && \
  cp -r /app/dist/apps/api-service/libs/shared/contracts/src/* node_modules/@kuraxx/contracts/ && \
  cp -r /app/dist/apps/api-service/libs/shared/types/src/* node_modules/@kuraxx/types/ && \
  cp -r /app/dist/apps/api-service/libs/shared/constants/src/* node_modules/@kuraxx/constants/
COPY apps/api-service/prisma ./prisma

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "dist/apps/api-service/apps/api-service/src/index.js"]
