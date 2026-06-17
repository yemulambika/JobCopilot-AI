FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY Ai-Resume-Maker/backend/package*.json ./
RUN npm ci --only=production

# Copy backend code
COPY Ai-Resume-Maker/backend/ ./

# Create uploads directory
RUN mkdir -p /app/uploads /app/logs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Run with PM2 inside container (optional, for process management)
CMD ["node", "server.js"]