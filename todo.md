# Pangostack TODO

Prioritized backlog: foundation items plus feature / ease-of-use improvements.
The core engine (definition model, deployment transparency, billing, health/metrics) is
solid — these focus on the authoring loop, the customer deploy experience, and self-service recovery.

## Foundation

- [x] **CI test/lint gate** — verification runs inside the Docker image builds (`deploy.yml` builds on every PR and push to `main`; push to Docker Hub only on `main`). Made the Dockerfiles consistent so every package is linted, built and unit-tested: added the missing `npm test` to the backend stage of the root `Dockerfile` and the missing `npm run lint` to `worker/Dockerfile` (worker already tested; backend/frontend already linted). No separate CI job — lint/build were already in the Dockerfiles, so a duplicate `verify` job was avoided.
- [x] **Observability** — integrated OpenTelemetry (open standard) in backend and worker via `src/tracing.ts`, started before app bootstrap. Opt-in through `OTEL_EXPORTER_OTLP_ENDPOINT`; backend→worker HTTP is traced end to end. _Follow-up: wire Temporal OTel interceptors for spans inside workflows/activities._
- [x] **Fix the docs entry point** — rewrote the root `README.md` (accurate 3-package structure, real `install:all`/`dev` quick start, Testing + Observability sections, links to `docs/DEFINITIONS.md` and `docs/HOSTING.md`) and replaced the stale NestJS-boilerplate `backend/README.md` (which referenced a non-existent `test:e2e`).

## Features & ease of use

- [ ] **Dry-run / plan before a real deploy** — a Terraform-style "here's what will be created" preview for both admin (authoring) and customer (deploying) before committing to real infra.
- [ ] **Self-service recovery from failed deploys** — a user-facing "retry / resume from the failed step" and "redeploy" action, building on the deployment step-transparency work.
- [ ] **Starter templates / definition catalog** — a gallery of ready-to-use definitions (Postgres, Redis, common apps) with "duplicate to customize" to collapse time-to-first-service.
- [ ] **Pre-deploy cost preview for the customer** — surface the estimated monthly price in the deploy form, before the customer commits.
- [ ] **Lifecycle notifications & outbound webhooks** — extend beyond in-app Notifo to email + outbound webhooks on deploy succeeded / failed / health-degraded.
- [ ] **Admin onboarding wizard + human-readable failures** — a guided "create your first service → write a definition → test deploy" path, and a layer that turns raw deploy logs into actionable causes for customers.
- [ ] **Live definition authoring** — schema-aware validation as you type plus a live "customer form" preview panel, so admins see the form their `parameters` produce without deploying (replaces the separate manual verify step).

## Suggested sequence

Live authoring and self-service recovery give the most value per effort and build on work
already in flight. Starter templates and cost preview are high-impact and relatively cheap.
The three foundation items run in parallel.
