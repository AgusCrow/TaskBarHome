# Stage 1: Build Frontend (Client)
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build Backend (Server)
FROM node:22-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# Stage 3: Production Runtime
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0
ENV OBSIDIAN_VAULT_PATH=/data/vault
ENV PHOTOS_PATH=/data/photos

# Install only production dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy compiled artifacts
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Default directories for persistent data
RUN mkdir -p /data/vault /data/photos

EXPOSE 3001

CMD ["node", "server/dist/index.js"]
