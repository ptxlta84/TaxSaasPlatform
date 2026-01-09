FROM node:20-alpine AS client-builder
WORKDIR /app/client
# Copy client package files
COPY client/package*.json ./
RUN npm ci
# Copy client source
COPY client/ .
# Build React App
RUN npm run build

FROM node:20-alpine
WORKDIR /app
# Create non-root user first
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
# Copy server package files (relative to root context)
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --omit=dev

# Copy server source
COPY server/ .
# Copy built client assets to where server expects them
# server/index.js looks in ../client/dist relative to itself
# So we place it in /app/client/dist
COPY --from=client-builder /app/client/dist /app/client/dist

# Create uploads directory (using the fixed /tmp location or just ensure perms)
# Our code uses /tmp now, but just in case
USER nodejs

EXPOSE 5000
CMD ["npm", "start"]
