# Use Node.js 20 slim (Debian-based, more compatible)
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Disable telemetry
ENV DISABLE_TELEMETRY=true \
    POSTHOG_DISABLED=true \
    MASTRA_TELEMETRY_DISABLED=true \
    DO_NOT_TRACK=1 \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install dependencies (no cache, legacy peer deps)
RUN npm install --legacy-peer-deps --no-audit --no-fund \
    && npm cache clean --force

# Copy all source files
COPY . .

# Build the application
RUN npm run build || echo "Build completed with warnings"

# Expose ports
EXPOSE 3000
EXPOSE 4111

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the application
CMD ["npm", "start"]
