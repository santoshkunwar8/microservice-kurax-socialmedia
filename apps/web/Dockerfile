# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web ./apps/web
COPY libs ./libs
COPY nx.json tsconfig.base.json ./

RUN npm ci

# Build shared libs needed by web
RUN npx nx build shared-types

RUN npx nx build @kuraxx/web

# Runtime stage - Nginx
FROM nginx:alpine

# Copy nginx config
COPY apps/web/nginx.conf /etc/nginx/nginx.conf

# Copy built app (from Nx build output)
COPY --from=builder /app/dist/apps/web /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
