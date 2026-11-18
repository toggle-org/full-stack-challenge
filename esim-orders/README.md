# esim-orders

A small eSIM order service built with NestJS 11, CQRS (`@nestjs/cqrs`), TypeORM and PostgreSQL.

## Prerequisites

- Node.js 24 (`.nvmrc`)
- Docker

## Setup

```bash
cp .env.example .env
docker compose up -d --wait
npm ci
npm test
```

PostgreSQL runs on `localhost:5434`; tests use a separate `esim_orders_test` database in the same container.
Migrations run automatically when the app or the tests start.

## Run

```bash
npm run start:dev   # http://localhost:3100
```

## Commands

| Command | What it does |
|---|---|
| `npm run start:dev` | Start the API in watch mode |
| `npm test` | Run all tests (Vitest) |
| `npx vitest run <path>` | Run one test file |
| `npm run build` | Compile to `dist/` |
| `npm run lint` | ESLint with auto-fix |
| `npm run migration:generate --name=<name>` | Generate a migration from entity changes |

## Code layout

Feature code lives in `src/modules/`. Project conventions are in [`CLAUDE.md`](CLAUDE.md)
(`AGENTS.md` holds the same text for other AI tools).
