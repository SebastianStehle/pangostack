# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Pangostack is a deployment platform for SaaS providers: customers self-deploy SaaS instances from declarative deployment definitions (JSON/YAML), with billing integration (Chargebee). It consists of three independent npm packages — each manages its own dependencies, so run `npm install` in each folder separately. The root package.json is tooling-only (husky, plus the `dev` convenience scripts below); it is not an npm workspace:

- **backend/** — NestJS API (port 3000, HTTPS in dev). Manages services, deployments, teams/users, billing, and orchestrates deployments via Temporal workflows.
- **worker/** — NestJS microservice (port 3100, HTTP). Provisions actual infrastructure resources (Vultr VMs, Vultr S3, Docker Compose over SSH, Helm). Called by the backend over REST.
- **frontend/** — Vite + React 18 customer portal and admin UI. Talks to the backend via a generated API client.

The administrator creates a service definition using yaml syntax to define the resource and dependencies. Examples are in the `config` folder.

## Commands

From the repo root, `npm run install:all` installs the dependencies of the root and all three packages. `npm run dev` then starts the whole stack: it brings up Postgres and pgadmin via docker compose and waits until Postgres is healthy, then runs Temporal (`temporal server start-dev`), the backend, the worker and the frontend concurrently with prefixed output. Related root scripts: `dev:infra` (infrastructure only), `dev:infra:down` (stop it), and `dev:temporal` / `dev:backend` / `dev:worker` / `dev:frontend` (a single process).

Temporal comes from the CLI, not from compose — `dev:infra` deliberately starts only `postgresql` and `pgadmin`, because the compose `temporal` and `temporal-ui` services would occupy ports 7233/8233 and conflict with `start-dev`. Note that `start-dev` keeps its state in memory, so workflow history is lost on restart; add `--db-filename` to the backend's `temporal-dev` script if you need it to persist.

Each package: `npm run dev` (watch mode), `npm run build`, `npm run lint` / `npm run lint:fix` (eslint, `--max-warnings 0`), `npm run format` (prettier).

Backend only:
- `npm test` — Jest (config in package.json: `rootDir: src`, testRegex `.*\.spec\.ts$`). Single test: `npx jest path/to/file.spec.ts` from backend/.
- `npm run typeorm:generate-migrations` — generate TypeORM migrations (data source: `src/domain/database/data-source.ts`).
- `npm run temporal-dev` — start a local Temporal dev server (alternative: `dev/pango/docker-compose.yml` runs Postgres + Temporal + pgadmin).

### Dev environment prerequisites (backend)

- One-time HTTPS certs via [mkcert](https://github.com/FiloSottile/mkcert) (required because the auth flow sets cookies before OAuth redirects): `mkcert -install`, then `npm run mkcert:create` in backend/ (writes to `backend/dev/`).
- Running Postgres — see `dev/postgres/docker-compose.yml`.
- A `.env` file in backend/ (credentials not in repo). Env vars are validated per-domain with Joi schemas (`AUTH_ENV_SCHEMA`, `DB_ENV_SCHEMA`, etc.) combined in `app.module.ts` — new env vars must be added to the matching schema or startup fails.

## Code generation (do not hand-edit generated folders)

There is a Swagger-driven generation chain between the packages:

1. Worker exposes OpenAPI at `http://localhost:3100/api-json`. Backend runs `npm run generate-worker` to regenerate its worker client in `backend/src/domain/workers/generated/`.
2. Backend exposes OpenAPI at `https://localhost:3000/api-json`. Frontend runs `npm run generate-api` to regenerate `frontend/src/api/generated/`.
3. Worker regenerates its Vultr API client with `npm run generate-vultr` (`worker/src/lib/vultr/generated/`).

The corresponding server must be running before regenerating a client. After changing controller DTOs/endpoints in worker or backend, regenerate the downstream client(s).

## Architecture

### Backend

- **CQRS pattern** (@nestjs/cqrs): all domain logic lives in `src/domain/<area>/use-cases/` as `Command`/`Query` classes with co-located `@CommandHandler`/`@QueryHandler` classes. Controllers in `src/controllers/` are thin — they dispatch to the bus and map results to DTOs. Follow this pattern for new features.
- **Domain areas** (`src/domain/`): auth (passport strategies: local, Google, GitHub, Microsoft, OAuth2, SAML; cookie sessions), billing (Chargebee + noop implementations), database, definitions, notifications, services, settings, users, workers (client for the worker microservice), workflows.
- **Database**: TypeORM + Postgres. Entities in `src/domain/database/entities/`, migrations in `src/domain/database/migrations/` — migrations are explicitly registered in `app.module.ts`, so new migrations must be added there.
- **Temporal workflows** (`src/domain/workflows/`): `workflows/` contains deterministic workflow code, `activities/` contains the side-effecting work (DB access, worker HTTP calls). Keep that separation — workflow code cannot do I/O directly. The central piece is `deployment-coordinator.ts`: one long-running workflow per deployment that receives signals (`signals.ts`) and executes child workflows `deployResources`/`deleteResources`.

### Worker

- Resource provisioners live in `worker/src/resources/<type>/` (`vultr-vm`, `vultr-storage`, `docker-compose-ssh`, `helm`) and implement the `Resource` interface from `worker/src/resources/interface.ts` (a typed `descriptor` via `defineResource`, plus apply/delete operations returning context + connection info). They are registered in a `Map<string, Resource>` keyed by the resource type string used in deployment definitions, injected via `RESOURCES_TOKEN`, and exposed generically through `controllers/resources/`.
- To add a new resource type: create a folder implementing `Resource`, register it in the map, then regenerate the backend worker client if DTOs changed.

### Frontend

- Vite + React 18, TypeScript, Tailwind 4 + daisyui. Server state via @tanstack/react-query, client state via zustand, forms via react-hook-form + yup.
- All backend calls go through the generated client in `src/api/generated/` — never hand-write fetch calls to the backend.
- Pages in `src/pages/` (admin/, teams/, login/, public/); shared components in `src/components/`. Route guards: `RouteWhenAdmin`, `RouteWhenPrivate`.
- Backend URL configured via `VITE_SERVER_URL` in `.env`.

## Coding Guidelines

* Always run linting after code generation to fix formatting issues.
* Always use IsEnum, not IsIn to make it consistent.
* Always use named constants for magic numbers.
* Do keep the number of tests small.
* Do not add unnecessary types, e.g. `void` for methods or return types that can easily be derived.
* Do not fail silently in case of errors. Try to log something if it makes sense.
* Do not generate migrations manually, use the right command for that (see commands).
* Do not make any assumptions about the use database.
* Do not update generated code files manually like package-lock.json. Use the right tools for that, e.g. `npm i`
* Do not use lightgray for normal text as it is difficult to read.
* Do not use reduce on array, write it manually.
* Do not write queries manually when using repositories to stay independent from the actual database.
* Do not omit brackets, e.g. `afterAll(() => context.close());`
* Move shared code in tests to `beforeEach` or `beforeAll`
* Only write comments to explain the why, not what the code does.
* Rely on prettier for formatting.
* Reuse TestContainers when possible, do not spin them up for every single test.
* Use daisy-UI components as much as possible.
* Use spread operators and simplifications for mappings.
* Use strict types for typescript code.
* Use TestContainers for database tests.
* Use the following syntax for tests: `it('should do y when y')`
* Use vitest for all tests.
* Write documentation in a very easy and practical style, so that it easy to follow. It should focus on how to use pangostack and the concepts and be very hands-on.

* When mapping code, use the following syntax

```
// DONT
.map((metric) => ({
        key: metric.key,
        label: metric.label,
        unit: metric.unit ? metric.unit.toUpperCase() : null,
        valueKeys: getValueKeys(metric),
        data: metric.datapoints.map((datapoint) => ({
          time: format(parseISO(datapoint.timestamp), 'HH:mm'),
          ...datapoint.values,
        })),

// DO
.map(({ key, label, unit, datapoints, values, timestamp, values }) => ({
        key,
        label,
        unit: metc.unit ? unit.toUpperCase() : null,
        valueKeys: getValueKeys(values),
        data: datapoints.map((datapoint) => ({
          time: format(parseISO(datapoint.timestamp), 'HH:mm'),
          ...datapoint.values,
        })),
```

Format @ApiProperty like this

```
@ApiProperty({
  description: 'Indicates if the info is public.',
  required: true,
})

or 

```
@ApiProperty({
  description: 'Indicates if the info is public.',
}
```

### Generated code

#### Worker Client

* Run the worker with `start:dev` in the `worker` directory
* Update the generated code with `generate-worker` in the `backend` directory

### Backend Client

* Run the worker with `start:dev` in the `backend` directory
* Run the temporal dev server with `temporal-dev` in the `backend` directory
* Update the generated code with `generate-worker` in the `frontend` directory

### Backend Migration

* Run the following command: `npm run typeorm:generate-migrations <NAME_OF_MIGRATION>` in the `backend` directory.
