# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Install Postgres client for wait-for-db.sh
RUN apt-get update && apt-get install -y postgresql-client

# Set legacy OpenSSL provider for Node.js (fixes Prisma/npx SSL errors)
ENV NODE_OPTIONS=--openssl-legacy-provider

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the backend code
COPY . .

# Make wait-for-db.sh executable
RUN chmod +x wait-for-db.sh

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS app
RUN npm run build

# Expose the backend port
EXPOSE 3001

# Start the app in production mode
CMD ["sh", "-c", "npx prisma migrate deploy && npx ts-node scripts/create-admin.ts && npm run start:prod"] 