# Base image
FROM node:20-alpine

# Work directory
WORKDIR /app

# Environment
ENV NODE_ENV=production

# Install dependencies first (leverage Docker layer cache)
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production

# Copy source
COPY index.js ./
COPY src ./src
COPY README.md ./README.md

# Entrypoint script selects mode
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Bot-only entrypoint (long polling)
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
