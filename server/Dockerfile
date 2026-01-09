FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Build if needed (not for raw node, but good structure)
# RUN npm run build || true

FROM node:20-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R nodejs:nodejs /app/uploads
USER nodejs

EXPOSE 5000

CMD ["npm", "start"]
