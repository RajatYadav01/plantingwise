# Build from the repository root so pnpm can resolve all workspace packages.
# Example: docker build -f apps/api/v1/Dockerfile -t plantingwise-api .
FROM node:22-alpine

# Enable the pnpm version declared in the root package.json.
RUN corepack enable
WORKDIR /workspace

# The API imports local workspace packages, so copy the whole monorepo before install.
COPY . .
RUN pnpm install --no-frozen-lockfile

# API secrets are injected at runtime (e.g. via Docker Compose), never baked into this image.
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Start the versioned Express API entry point.
CMD ["pnpm", "--filter", "@plantingwise/api", "start"]
