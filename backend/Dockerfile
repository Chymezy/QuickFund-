# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built app and Prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

# Install PostgreSQL client (Alpine version)
RUN apk add --no-cache postgresql-client

# Copy and set permissions for wait-for-db.sh
COPY wait-for-db.sh ./
RUN chmod +x wait-for-db.sh

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3001

CMD ["./start.sh"] 