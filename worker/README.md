# Worker

The Pangostack worker: a [NestJS](https://github.com/nestjs/nest) microservice that provisions the
actual infrastructure for a deployment. The backend calls it over REST (plain HTTP on port **3100**);
it is not exposed to end users.

Resource provisioners live in `src/resources/<type>/` and implement the `Resource` interface:

- `vultr-vm` — Vultr virtual machines (provides an SSH connection)
- `vultr-storage` — Vultr S3-compatible storage
- `docker-compose-ssh` — Docker Compose over SSH
- `helm` — Helm releases

For setup and running the whole stack, see the [root README](../README.md). To run just this service in
watch mode: `npm run dev` (it needs no dev certificate — unlike the backend, it serves plain HTTP).

## Common scripts

```bash
npm run dev            # watch mode (nest start --watch)
npm run build          # production build
npm run lint           # eslint, --max-warnings 0
npm test               # unit tests (vitest)
npm run generate-vultr # regenerate the Vultr API client from the filtered OpenAPI spec
```

## Code generation

The worker exposes its own OpenAPI document at `http://localhost:3100/api-json`; the backend consumes it
via `npm run generate-worker`. After changing controller DTOs or endpoints here, regenerate the backend
worker client. See [CLAUDE.md](../CLAUDE.md) for the full cross-package generation chain and for how to
add a new resource type.

## Observability

The worker is instrumented with OpenTelemetry (`src/tracing.ts`), started before app bootstrap and
opt-in via `OTEL_EXPORTER_OTLP_ENDPOINT`. See the [root README](../README.md#observability) for details.
