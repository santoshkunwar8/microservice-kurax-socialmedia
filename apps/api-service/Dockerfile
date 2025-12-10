# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only the necessary files for installation
COPY package.json package-lock.json ./
COPY apps/api-service ./apps/api-service
COPY libs ./libs
COPY nx.json tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Build the API service
RUN npx nx build api-service

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/apps/api-service/dist ./dist
COPY apps/api-service/prisma ./prisma

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "dist/index.js"]
