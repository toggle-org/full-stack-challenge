# Project conventions

Guidance for anyone, human or AI assistant, changing code in this repository.

## Commands

- `npm test`: all tests. `npx vitest run <path>`: one file.
- `npm run build`, `npm run lint`.
- `npm run migration:generate --name=<name>`, then register the new class in `src/database/migrations/index.ts`.

## Architecture

NestJS 11 with CQRS (`@nestjs/cqrs`), TypeORM and PostgreSQL.

- `src/modules/<feature>/`: `controllers/`, `commands/`, `queries/`, `services/`, `entities/`, `dto/`, `errors/`, `tests/`.
- `src/integrations/`: clients for external vendors, each behind an interface and a DI token. In this repository they are in-process fakes.
- `src/database/`: data source and migrations. `src/test-utils/`: helpers for integration tests.

## Rules

- Controllers are thin: they only dispatch through `CommandBus`/`QueryBus` and return the result.
- A command or query class and its handler live in the same file (`*.command.ts`, `*.query.ts`).
- Handlers orchestrate services and never inject repositories. Services own the domain logic and throw the domain errors in `errors/`.
- Modules reach each other only through `CommandBus`/`QueryBus`, never through another module's service or repository.
- Vendors are reached only through the interfaces and tokens in `src/integrations/`.
- Money is integer cents.
- Every function has an explicit return type, and there are no magic numbers outside tests (both lint-enforced).
- Entity properties are camelCase; columns are snake_case through `@Column({ name })`.
- Transactions use `typeorm-transactional` decorators (`@Transactional()`), not manual query runners.
- Schema changes go through a migration; `synchronize` stays off.
- Tests live in a `tests/` folder next to the code: Vitest, `vitest-mock-extended` for unit tests, `@faker-js/faker` for test data. Integration tests boot the real `AppModule` with `createTestApp()` from `src/test-utils`.
