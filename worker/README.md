# Worker

The Pangostack worker: a [NestJS](https://github.com/nestjs/nest) microservice that provisions the
actual infrastructure for a deployment. The backend calls it over REST (plain HTTP on port **3100**);
it is not exposed to end users.

Resource provisioners live in `src/resources/<type>/` and implement the `Resource` interface, grouped
by what they provision:

**Virtual machines** (each provides an SSH connection)

- `vultr-vm` — Vultr virtual machines
- `aws-vm` — AWS EC2 instances
- `azure-vm` — Azure virtual machines (including their network resources)
- `gcp-vm` — Google Compute Engine instances

**Storage**

- `vultr-storage` — Vultr S3-compatible storage
- `aws-s3` — AWS S3 buckets
- `azure-blob` — Azure Blob Storage containers
- `gcp-storage` — Google Cloud Storage buckets

**Application deployment**

- `docker-compose-ssh` — Docker Compose over SSH
- `helm` — Helm releases

**Infrastructure as code**

- `terraform` — applies a Terraform configuration (state is stored with the deployment)

For setup and running the whole stack, see the [root README](../README.md). To run just this service in
watch mode: `npm run dev` (it needs no dev certificate — unlike the backend, it serves plain HTTP).

## Common scripts

```bash
npm run dev            # watch mode (nest start --watch)
npm run build          # production build
npm run lint           # eslint, --max-warnings 0
npm test               # unit tests (vitest)
npm run generate       # generate the Vultr API client from the filtered OpenAPI spec (needs Docker, runs before dev)
```

## Code generation

The worker's API is described in `openapi.yaml`, which the backend uses to generate its worker client. After
changing controller DTOs or endpoints here, run `npm run openapi` while the dev server is running, then
`npm run generate` in backend/. See [CLAUDE.md](../CLAUDE.md) for the full cross-package generation chain and for how to
add a new resource type.

## Observability

The worker is instrumented with OpenTelemetry (`src/tracing.ts`), started before app bootstrap and
opt-in via `OTEL_EXPORTER_OTLP_ENDPOINT`. See the [root README](../README.md#observability) for details.
