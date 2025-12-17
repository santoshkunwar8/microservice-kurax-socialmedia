# Build stage
FROM node:20 AS builder

WORKDIR /app

# Copy only the necessary files for installation
COPY package.json package-lock.json ./
COPY apps/ws-service ./apps/ws-service
COPY libs ./libs
COPY nx.json tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Build the WS service
RUN npx nx build ws-service

# Runtime stage
FROM node:20

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist


# Copy built local libs for workspace packages
RUN mkdir -p node_modules/@kuraxx/constants && \
  cp -r /app/dist/apps/ws-service/libs/shared/constants/src/* node_modules/@kuraxx/constants/ && \
  mkdir -p node_modules/@kuraxx/types && \
  cp -r /app/dist/apps/ws-service/libs/shared/types/src/* node_modules/@kuraxx/types/

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3002/health || exit 1

# Start application
CMD ["node", "dist/apps/ws-service/apps/ws-service/src/index.js"]
