# Dockerfile
FROM mcr.microsoft.com/playwright:v1.42.0-focal

# Set working directory
WORKDIR /app

# Install Node.js dependencies
COPY package*.json ./
RUN npm install

# Install Playwright browsers
RUN npx playwright install chromium

# Copy application files
COPY . .

# Create directory for logs
RUN mkdir -p /app/logs

# Run as non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Start the application
CMD ["node", "index.js"]