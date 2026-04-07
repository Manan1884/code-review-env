# Runtime build Dockerfile for HF Spaces
FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy all source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_OUTPUT=standalone
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Build as root (needed for HF Spaces secrets access during build)
RUN npm run build

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output to final location and fix permissions
RUN mkdir -p /app/.next/standalone/.next/static && \
    cp -r /app/.next/static/* /app/.next/standalone/.next/static/ 2>/dev/null || true && \
    cp -r /app/public /app/.next/standalone/ 2>/dev/null || true && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

# Start the standalone server
CMD ["node", ".next/standalone/server.js"]
