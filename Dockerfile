# Use official Node.js runtime as base image
FROM node:22-alpine

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY server.js ./
COPY public/ ./public/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Set default port (can be overridden by environment variable)
ENV PORT=3000
ENV NODE_ENV=production

# Expose port (will be dynamic based on PORT env var)
EXPOSE $PORT

# Start the application
CMD ["node", "server.js"]
