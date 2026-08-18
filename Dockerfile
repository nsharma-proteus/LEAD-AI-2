# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy codebase
COPY . .

# Build Vite frontend and CJS server bundle
RUN npm run build

# Stage 2: Production environment
FROM node:20-slim AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/leads_store.json ./leads_store.json

# Install only production dependencies (excluding devDependencies)
RUN npm ci --only=production

# Bind to standard port (Cloud Run will override with PORT env var)
EXPOSE 3000

# Start command
CMD ["npm", "start"]
