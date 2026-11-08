# Plantingwise

Plantingwise helps people identify houseplants from photos, review possible visible symptoms, organise a personal garden, follow care tasks, and keep a photo-based growth journal. It is designed as a portfolio demonstration: the browser app can be explored in sample mode without creating an account, while account-based persistence and live AI analysis require server-side credentials.

## Table of contents

- [Plantingwise](#plantingwise)
  - [Table of contents](#table-of-contents)
  - [Features](#features)
  - [Tech stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Working](#working)
  - [Development](#development)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)
      - [1. Clone the project's repository](#1-clone-the-projects-repository)
      - [2. Install dependencies](#2-install-dependencies)
      - [3. Configure local environment variables](#3-configure-local-environment-variables)
      - [4. Start PostgreSQL, and migrate](#4-start-postgresql-and-migrate)
      - [5. Start the web application](#5-start-the-web-application)
      - [6. Run checks and browser tests](#6-run-checks-and-browser-tests)
      - [To run the project using Docker](#to-run-the-project-using-docker)

## Features

- **Plant identification:** Select or capture a plant photo and request an AI-assisted identification with observations, care guidance, and uncertainty notes.
- **Plant health review:** Submit a photo of visible symptoms and receive possible explanations and suggested next steps. Results are informational, not a definitive diagnosis.
- **Personal garden:** Browse and manage a collection of saved plants, including plant details and care information.
- **Care calendar:** Review upcoming care tasks, mark tasks complete, and schedule follow-up reminders.
- **Growth journal:** Keep dated notes and photos to track changes in a plant over time.
- **Mobile-native interactions:** Use the camera and photo library, haptic feedback, and local notifications on supported iOS and Android devices.
- **Sample demonstration mode:** Explore the garden and sample analysis flow without connecting Neon or OpenRouter.
- **Authentication and persistence:** Register and sign in through the API. JWT sessions are stored in HttpOnly cookies, and private records are scoped to their owner.
- **Cross-platform delivery:** Run the Expo application on iOS, Android, and the web. The web build can be hosted as a static site, and an Android preview can be built with EAS.

## Tech stack

- **Mobile and Web**: React Native, Expo, TypeScript
- **API**: Node.js, Express
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **AI**: OpenRouter
- **Testing**: Vitest for unit and integration tests, Playwright for E2E tests
- **Tooling**: pnpm, Turborepo, Biome, Zod, Docker, Docker Compose
- **Deployment**: [Vercel](https://vercel.com) (Web) and [Neon](https://neon.com) (Database)

## Project Structure

```text
plantingwise/
├── apps/
│   ├── api/
│   │   └── v1/
│   │       ├── src/
│   │       │   ├── controllers/       # HTTP request handlers
│   │       │   ├── middleware/        # Authentication, validation, origin and error handling
│   │       │   ├── routes/            # Versioned Express routes
│   │       │   ├── services/          # AI and domain logic; tests colocated with source
│   │       │   ├── types/             # Express request type augmentation
│   │       │   ├── app.ts             # Express application composition
│   │       │   └── server.ts          # HTTP server entry point
│   │       ├── vitest.config.ts
│   │       ├── vitest.setup.ts
│   │       ├── package.json
│   │       ├── Dockerfile
│   │       └── .env.example
│   └── mobile/
│       ├── assets/
│       │   └── icons/                 # App, adaptive, monochrome and web PNG icons
│       ├── src/
│       │   ├── app/                   # Thin Expo Router routes and layouts
│       │   ├── features/              # Feature-first application code
│       │   │   ├── analysis/          # Plant identification and symptom analysis
│       │   │   ├── auth/              # Sign-in and registration
│       │   │   ├── care/              # Care tasks, schedules and reminders
│       │   │   ├── garden/            # Garden dashboard and provider
│       │   │   ├── journal/           # Growth journal
│       │   │   ├── plants/            # Plant collection and details
│       │   │   └── settings/          # Preferences and settings
│       │   ├── components/            # Shared UI primitives
│       │   ├── themes/                # Design tokens
│       │   └── lib/                   # API, storage and native adapters
│       ├── vitest.config.ts
│       ├── vitest.setup.ts
│       ├── package.json
│       ├── Dockerfile
│       └── .env.example
├── packages/
│   ├── config/                        # Per-app Zod environment schemas and tests
│   ├── constants/                     # Sample garden data and demo AI responses
│   ├── database/                      # Neon client, Drizzle schema, relations and DB scripts
│   │   ├── src/db/
│   │   │   ├── relations.ts           # Drizzle defineRelations() metadata
│   │   │   └── schema.ts              # PostgreSQL table declarations
│   │   ├── drizzle.config.ts
│   │   ├── sql/                       # Reviewed initial SQL reference
│   │   └── package.json               # db:generate, db:migrate, db:push, db:studio
│   ├── e2e-tests/                     # Playwright browser journeys and configuration
│   ├── schemas/                       # Shared Zod payload and AI response schemas
│   ├── tsconfig/                      # Shared TypeScript configurations
│   └── types/                         # Shared TypeScript contracts and helpers
├── .github/workflows/                 # GitHub Actions checks
├── docker-compose.yml
├── biome.json
├── lint-staged.config.mjs
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

Expo Router's route files live in `apps/mobile/src/app`. Keep this directory for route adapters and layouts; put screen implementations, feature-specific components, hooks, services, and state under `apps/mobile/src/features/<feature>`. Cross-cutting UI components and platform adapters belong in `src/components` and `src/lib`.

Unit and integration tests are colocated next to the code they cover, using names such as `analysis.service.unit.test.ts`, `app.integration.test.tsx`, `PlantCard.unit.test.tsx`, and `GardenProvider.integration.test.tsx`. Each app or package that contains Vitest tests has its own `vitest.config.ts` and `vitest.setup.ts`. Browser E2E tests are kept in `packages/e2e-tests` because they exercise the complete running application.

## Working

Plantingwise has two operating modes:

1. **Sample mode:** The Expo application loads the bundled sample garden and sample AI analysis responses. This mode is intended for a quick portfolio walkthrough and does not require a Neon database or an OpenRouter API key. For a sample-only local setup, leave `DATABASE_URL`, `JWT_SECRET`, and `OPENROUTER_API_KEY` empty in the API environment file.
2. **Connected mode:** The mobile/web client sends requests to the Express API under `/api/v1`. The API validates requests, uses Neon PostgreSQL through the shared database package for account-based data, and calls OpenRouter from the server for live image analysis. Configure `DATABASE_URL`, `JWT_SECRET`, and (for live AI) `OPENROUTER_API_KEY` on the API server.

The API returns a JWT session in the `plantingwise_session` HttpOnly cookie. Browser requests use credentialed CORS and must originate from an explicitly allowed `CLIENT_ORIGIN`. The API scopes private plant, analysis, care-task, and journal records to the authenticated user. Provider credentials and database credentials remain server-side; `EXPO_PUBLIC_*` values are public because Expo embeds them into the client bundle.

On iOS and Android, the app can use the device camera/photo library, haptics, and local notifications. Native notification delivery and permission prompts should be verified on a physical device or emulator; the browser demo focuses on the in-app care schedule. The current demo stores compressed photo data in PostgreSQL for simplicity. A production service should store image files in private object storage and keep only object references and metadata in Neon.

## Development

### Prerequisites

- Node.js (preferably, version >= v24.x)
- PostgreSQL (preferably, version >= v18.x)
- pnpm (preferably, version >= v12.5.1)
- OpenRouter account
- OpenSSL (or another secure random generator)
- Docker (preferably the latest version)
- Git (preferably the latest version)

### Setup

#### 1. Clone the project's repository

Clone the repository and move into its root directory. Replace the placeholder URL with the Git remote for your copy of Plantingwise.

```shell
git clone https://github.com/rajatyadav01/plantingwise.git
cd plantingwise
```

#### 2. Install dependencies

Enable Corepack and install the workspace dependencies from the monorepo root:

```shell
corepack enable
pnpm install
```

The root `package.json` pins pnpm to `10.20.0`. If this checkout does not yet contain a `pnpm-lock.yaml`, the first install will create one; commit that lockfile so local development and CI use reproducible dependency versions.

#### 3. Configure local environment variables

Create an environment file for the API and another for the Expo client:

```shell
cp apps/api/v1/.env.example apps/api/v1/.env
cp apps/mobile/.env.example apps/mobile/.env
```

**API environment — `apps/api/v1/.env`**

For connected mode, update these values:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection string. Copy the pooled connection string from the Neon console and retain its SSL parameters. |
| `JWT_SECRET` | Random signing secret of at least 32 characters. Generate one with `openssl rand -base64 48`. |
| `NODE_ENV` | Use `development` locally. |
| `PORT` | API port; defaults to `4000`. |
| `CLIENT_ORIGIN` | Exact browser origin allowed by credentialed CORS; normally `http://localhost:8081` for local web development. |
| `COOKIE_SAME_SITE` | Normally `lax` for local same-site development. Cross-site production cookies require HTTPS and `none` with Secure cookies. |
| `OPENROUTER_API_KEY` | Optional server-side API key for live image analysis. |
| `OPENROUTER_MODEL` | Optional vision-capable model ID enabled for your OpenRouter account. |
| `OPENROUTER_SITE_URL` | Optional OpenRouter attribution URL. |
| `OPENROUTER_APP_NAME` | Optional provider attribution name; defaults to `Plantingwise`. |

For sample-only mode, set `DATABASE_URL=`, `JWT_SECRET=`, and `OPENROUTER_API_KEY=`. Do not leave the example placeholder database URL in place if you do not have a Neon database. Never commit populated `.env` files or expose API secrets through Expo variables.

**Expo client environment — `apps/mobile/.env`**

| Variable | Description |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | API origin only, without `/api/v1`. Use `http://localhost:4000` for a browser on the same computer, `http://10.0.2.2:4000` for the Android emulator, or your development computer's LAN IP for a physical device. |
| `EXPO_PUBLIC_APP_ENV` | `development`, `preview`, or `production`; use `development` locally. Production builds require an HTTPS API URL. |

The Zod schemas in `packages/config/src/env/api-env.ts` and `mobile-env.ts` validate each app's environment independently. Expo statically embeds `EXPO_PUBLIC_*` values into the client bundle, so these variables must never contain secrets. Restart Expo after changing client environment values.

#### 4. Start PostgreSQL, and migrate

Plantingwise uses **Neon, which is a managed PostgreSQL service**. You do not need to start a local PostgreSQL server for the standard setup. Create a Neon project/database, copy its connection string into `DATABASE_URL` in `apps/api/v1/.env`, and ensure the API environment file is saved.

The database package owns `drizzle.config.ts` and all database lifecycle scripts. From the repository root, generate the initial migration and apply it:

```shell
pnpm db:generate
pnpm db:migrate
```

Review and commit generated migration files under `packages/database/drizzle/`. When migrations have already been generated and committed, a fresh environment only needs:

```shell
pnpm db:migrate
```

For local schema experimentation, you can instead synchronise the development database directly from the Drizzle schema:

```shell
pnpm db:push
```

`db:push` is convenient during development, but use reviewed, versioned migrations for repeatable deployments. The database configuration reads the API environment file at `apps/api/v1/.env` and preserves environment variables supplied by the shell or CI. The relation graph is defined with Drizzle's `defineRelations()` API in `packages/database/src/db/relations.ts`.

> **Sample mode:** If you only want to explore the browser demo, you can skip Neon setup and database migrations. Leave `DATABASE_URL` and `JWT_SECRET` empty in the API `.env` file.

#### 5. Start the web application

Run the API and Expo web app in separate terminal windows from the repository root.

**Terminal 1 — API**

```shell
pnpm dev:api
```

The API health endpoint should be available at `http://localhost:4000/api/v1/health`.

**Terminal 2 — Expo web**

```shell
pnpm dev:web
```

Open the web application at `http://localhost:8081`.

The root `pnpm dev` command starts the workspace development tasks in parallel. Use `pnpm dev:web` when you specifically want the browser target. For native development, run `pnpm --filter @plantingwise/mobile dev` and open the project in an iOS simulator or Android emulator.

If you test on a physical phone, set `EXPO_PUBLIC_API_URL` to your computer's reachable LAN IP address and ensure the phone and development computer are on the same network. Set `CLIENT_ORIGIN` to the exact browser origin when using the web client.

#### 6. Run checks and browser tests

Run the Biome checks, TypeScript checks, Vitest suites, and Playwright browser tests from the repository root:

```shell
# Lint, formatting and other Biome checks (without writing changes)
pnpm check

# TypeScript checks across workspaces
pnpm typecheck

# Unit and integration test files executed by Vitest
pnpm test:unit

# Install the Chromium browser used by the Playwright suite (first run only)
pnpm exec playwright install chromium

# Run browser end-to-end tests; Playwright starts the API and web app itself
pnpm test:e2e
```

You can run the combined test command with:

```shell
pnpm test
```

Useful additional commands:

```shell
pnpm lint       # Biome lint rules only
pnpm format     # Apply Biome formatting
pnpm db:studio  # Open Drizzle Studio for the configured database
```

Vitest configuration and setup files are maintained per workspace. Unit and integration tests are colocated next to their implementation. Playwright tests in `packages/e2e-tests` verify the sample-mode browser journey, including opening a plant, completing a care task, and reviewing sample AI guidance. Native camera permissions, haptic feedback, and operating-system notification delivery require a separate device-level smoke test.

#### To run the project using Docker

Docker Compose builds and starts the API container and the static Expo web application. The current `docker-compose.yml` **does not start a PostgreSQL container**; the API still connects to Neon. Create and configure the API environment file first:

```shell
cp apps/api/v1/.env.example apps/api/v1/.env
```

For connected mode, set a valid Neon `DATABASE_URL` and a strong `JWT_SECRET` in `apps/api/v1/.env`. For a sample-only walkthrough, leave both values empty. The mobile web image receives `EXPO_PUBLIC_API_URL` at build time; its default is `http://localhost:4000`.

Build and start both containers from the repository root:

```shell
docker compose up --build
```

Or use the root scripts:

```shell
pnpm docker:up
```

Open:

- **Plantingwise web app:** `http://localhost:8081`
- **API health check:** `http://localhost:4000/api/v1/health`

Stop the containers with:

```shell
docker compose down
# or
pnpm docker:down
```

The mobile Dockerfile exports the Expo web target and serves the static files with Nginx; it does not create an Android APK or iOS application build. `EXPO_PUBLIC_API_URL` is a public build-time setting embedded in the web bundle. API secrets are injected at container runtime using `apps/api/v1/.env` and are never baked into the Docker image.
