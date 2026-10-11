# Backend

The Pangostack backend: a [NestJS](https://github.com/nestjs/nest) API that manages services,
deployments, teams/users and billing, and orchestrates deployments via
[Temporal](https://temporal.io/) workflows.

For setup, prerequisites (HTTPS certs, `.env`, Postgres) and running the whole stack, see the
[root README](../README.md). This package rarely runs on its own — the backend calls the worker and
drives Temporal.

## Common scripts

```bash
npm run dev          # watch mode (nest start --watch)
npm run build        # production build
npm run lint         # eslint, --max-warnings 0
npm test             # unit tests (vitest)
npm run test:int     # integration tests (TestContainers-backed Postgres)
npm run test:cov     # unit tests with coverage
```

## Code generation & migrations

- `npm run generate` generates the worker REST client from `../worker/openapi.yaml` (needs Docker, runs before `dev`).
- `npm run openapi` updates `openapi.yaml` from the running dev server. Run it after changing controllers, then `npm run generate` in frontend/ and e2e/.
- `npm run typeorm:generate-migrations <Name>` generates a TypeORM migration — never hand-write them.

See [CLAUDE.md](../CLAUDE.md) for the full architecture (CQRS, domains, Temporal workflows) and the
cross-package code-generation chain.
