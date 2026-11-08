# Build from the repository root so the pnpm workspace packages are available.
# This image exports the Expo web target and serves it with Nginx; it is not the native APK build.
FROM node:22-alpine AS builder

RUN corepack enable
WORKDIR /workspace
COPY . .
RUN pnpm install --no-frozen-lockfile

# Expo public variables are compiled into the web bundle. This URL is not a secret.
ARG EXPO_PUBLIC_API_URL=http://localhost:4000
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}
RUN pnpm --filter @plantingwise/mobile build:web

# Copy only the static browser bundle into the small runtime image.
FROM nginx:1.27-alpine AS runner
COPY --from=builder /workspace/apps/mobile/dist /usr/share/nginx/html
COPY apps/mobile/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]