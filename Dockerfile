# Multi-stage Docker build for CodeDocAI
# Stage 1: Build frontend
# Stage 2: Production runtime with backend

# ===== Stage 1: Build Frontend =====
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build frontend with Vite
RUN npm run build

# ===== Stage 2: Production Runtime =====
FROM node:18-alpine AS production

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist ./dist

# Copy backend server files
COPY server.ts ./
COPY tsconfig.json ./
COPY index.html ./

# Copy source files needed for backend
COPY src ./src

# Install tsx for running TypeScript directly
RUN npm install -g tsx

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
