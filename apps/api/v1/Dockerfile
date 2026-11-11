# ==========================================
# STAGE 1: Prune the Monorepo
# ==========================================
FROM node:24-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm turbo

# Copy full monorepo source temporarily
COPY . .

# Prune the monorepo to ONLY include @plantingwise/api and its workspace dependencies
RUN turbo prune @plantingwise/api-v1 --docker

# ==========================================
# STAGE 2: Build the Application
# ==========================================
FROM node:24-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm

ENV PNPM_CONFIG_FROZEN_LOCKFILE=false

# First, install dependencies using pruned pnpm-lock.yaml (Layer Caching)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Copy pruned source code
COPY --from=pruner /app/out/full/ .

# Build the project (TypeScript compilation)
RUN pnpm --filter=@plantingwise/config build:types
RUN pnpm --filter=@plantingwise/constants build:types
RUN pnpm --filter=@plantingwise/schemas build:types
RUN pnpm --filter=@plantingwise/types build:types
RUN pnpm --filter=@plantingwise/api-v1 build:types

# ==========================================
# STAGE 3: Production Runner
# ==========================================
FROM node:24-alpine AS runner
WORKDIR /app

# Set production env
ENV NODE_ENV=production

# Set CI=true so pnpm skips TTY interactive confirmations in non-interactive environments
ENV CI=true

RUN apk add --no-cache libc6-compat
RUN corepack enable

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy pruned workspace structure and dependencies
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=expressjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder --chown=expressjs:nodejs /app/apps/api/v1 ./apps/api/v1
COPY --from=builder --chown=expressjs:nodejs /app/packages ./packages
COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules

# Ensure the expressjs user owns the entire working directory for Prisma, pnpm, or node need to write temporary files in /app)
RUN chown -R expressjs:nodejs /app

USER expressjs

EXPOSE 3005

# Entrypoint script or command that starts the app
CMD ["sh", "-c", "pnpm --filter=@plantingwise/api-v1 start"]
