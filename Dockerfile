# Simplified Docker build for CodeDocAI
# Build frontend locally FIRST with: npm run build
# Then run: docker-compose up --build

FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy PRE-BUILT frontend from local dist/
COPY dist ./dist

# Copy backend server files
COPY server.ts ./
COPY tsconfig.json ./
COPY index.html ./

# Copy source files needed for backend
COPY src ./src

# Install tsx for running TypeScript
RUN npm install -g tsx

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
