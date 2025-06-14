# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create non-root user first
RUN addgroup -g 1001 -S appuser && adduser -S -u 1001 -G appuser appuser

# Install Node.js dependencies
COPY package*.json ./
RUN npm install

# Create necessary directories
RUN mkdir -p /app/logs /app/lib

# Copy application files
COPY --chown=appuser:appuser index.js config.js ./
COPY --chown=appuser:appuser lib ./lib/

# Set correct permissions
RUN chmod -R 755 /app && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD pgrep -x node || exit 1

# Start the application
CMD ["node", "index.js"]