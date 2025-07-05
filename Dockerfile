# syntax = docker/dockerfile:1

# Base stage with Node.js
ARG NODE_VERSION=22.17.0
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# Build stage
FROM base AS build
LABEL fly_launch_runtime="Next.js"

# Install build dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python3

# Install all Node.js dependencies (including devDependencies)
COPY package-lock.json package.json ./
RUN npm ci

# Copy application code and build the application
COPY . .
ENV MONGODB_URI=mongodb://localhost:27017/dnd-tracker-build
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy production dependencies and prune devDependencies
COPY --from=build /app/package-lock.json /app/package.json ./
RUN npm ci --omit=dev

# Copy built application artifacts
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build /app/docker-entrypoint.js ./docker-entrypoint.js

# Set the user to the non-root user
USER nextjs

# Expose the port and add a health check
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Entrypoint and command to start the application
ENTRYPOINT [ "./docker-entrypoint.js" ]
CMD [ "npm", "run", "start" ]