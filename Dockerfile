# Use full Node.js 20 image (includes all build tools)
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies with force flag (most permissive)
RUN npm install --force

# Copy all application files
COPY . .

# Build the application
RUN npm run build

# Expose ports
EXPOSE 3000 4111

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start application
CMD ["npm", "start"]
