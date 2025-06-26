# Install dependencies only when needed
FROM node:18 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the app
FROM node:18 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy only necessary files
FROM node:18-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built app and node_modules from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/postcss.config.mjs ./
COPY --from=builder /app/.env.local ./

EXPOSE 3000

CMD ["npm", "run", "start"] 