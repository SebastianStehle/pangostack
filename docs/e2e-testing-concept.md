# Concept: E2E API Tests and UI Tests

How to run and extend the suites is described in [`e2e/README.md`](../e2e/README.md). This document explains why they are built the way they are.

## Problem

Unit tests, integration tests (handlers against a real Postgres) and Storybook test layers in isolation. Nothing tested the system as a customer uses it: HTTP API → backend → Temporal → worker → real resources → back into the database, plus the UI on top. The bugs that hurt most live in those seams. Writing the first suites found several of them (see "Bugs found").

## Core idea (borrowed from Squidex)

Squidex keeps two black-box suites next to the product: the API **TestSuite** and the **Playwright e2e** tests. We follow the same rules:

1. **Test the shipped artifact.** The tests run against the Docker images that CI builds, started with docker compose. Nothing runs in-process and nothing is mocked inside the backend.
2. **Talk to the system like a customer.** API tests use a generated client and an API key. UI tests use a real browser and the real login form.
3. **Expensive state is created once.** A test file shares a freshly created service, team and finished deployment in `beforeAll`, like class fixtures in Squidex. Tests that change state get their own in `beforeEach`.
4. **Isolation through random names, not cleanup.** Tests never depend on an empty database and never assert global counts. They run in parallel and repeatedly against the same stack.
5. **Poll for eventual consistency.** Deployments run in Temporal and are awaited with `waitForDeployment`, never with `sleep`. A deployment that ends in the wrong state fails the test immediately with the step error.
6. **Snapshot response shapes, scrub the noise.** Vitest file snapshots replace Squidex's Verify. `scrub()` removes IDs, dates and random names.
7. **Stand-ins for the outside world are containers.** Squidex uses a webhook catcher. We deploy real containers with `docker-compose-ssh` to a Docker-in-Docker container, so no cloud account is needed.
8. **CI gate.** Build images → e2e tests → push images. `squidex/pangostack-dev` is always a tested build.

## Decisions

**Real Docker instead of a fake resource type.** The deployment tests use the `docker-compose-ssh` code we ship: SSH, compose upload, readiness polling, status, logs and delete. The deploy target is `docker:dind` plus `openssh`, so `docker ps` on the target only sees deployments, never the e2e stack itself. Failures come from a compose file with an image that does not exist. A fake resource type was planned for edge cases (failure at a specific sub-step, `Degraded` health). It is not built yet, because no test needs it so far.

**HTTPS in front of the backend.** Production cookies are `Secure`, so the stack uses Caddy with an internal certificate. This mirrors a real ingress. The API tests accept the self-signed certificate, and so does the browser (`ignoreHTTPSErrors`).

**Fast failures.** `WORKFLOW_STEP_MAX_ATTEMPTS=1` in the stack makes a failing step fail right away. Workflow code cannot read the configuration, so the backend passes the value to the deployment coordinator in the signal.

**A fourth npm package.** `e2e/` is independent like the other packages. It generates its own client from the backend's OpenAPI, so it is a real external consumer.

**Playwright for the UI.** This is an intentional exception to "use vitest for all tests". Storage-state login, traces, retries and the HTML report are what make browser tests maintainable. Storybook remains the place for component tests.

**Selectors by role and label.** The UI tests import the texts from `frontend/src/texts`, so copy changes do not break them. Elements without an accessible name get an `aria-label` or a role in the frontend, not a CSS selector. So far that applies to property columns (now labelled groups), the delete deployment button and the remove member button.

## Scope

There are about 20 tests per suite. Each one covers a flow a customer or admin relies on.

| API suite | Cases |
|---|---|
| `auth` | API key; no credentials → 401; password login keeps a session; wrong password → 400 |
| `services` | Create with version (snapshot); invalid definition → 400; unknown resource type fails verification; public service visible to end users; non-admins cannot manage services |
| `teams` | Creator becomes member; added member gets access; non-members cannot rename |
| `deployments` | Completes (snapshot of deployment and steps); live status with image version; parameters reach the container (logs); update applies new parameters; missing image → Failed with the real error; delete removes the containers; required parameter is validated; non-members get 403 |

| UI suite | Cases |
|---|---|
| `login` | New user is asked to create a team; wrong password shows an error; non-admins are kept out of administration |
| `teams` | Create team; add member; remove member |
| `deployments` | Catalog lists the service; deploy with parameters until it succeeds; team list shows the status; resource steps; log viewer; edit parameters; failure reason |
| `admin` | Create service; create version from YAML; verify definition; open deployment from the list; delete deployment; create user; worker with resource types |

## Bugs found

Writing the suites found these bugs. They are fixed together with the suites:

- **Creating users failed.** `POST /api/users` always returned 500, because no ID was generated.
- **Team mutations were not authorized.** Any logged-in user could rename any team, add members to it or remove its members. `putTeam`, `postTeamUser` and `deleteTeamUser` now use `TeamPermissionGuard`.
- **Step errors were useless.** Users saw `ActivityFailure: Activity task failed` instead of the actual reason.
- **Edited deployments showed stale data.** After "Deploy Now" on the edit page, the detail page showed the old parameters and stopped polling until a reload.
- **Compose deployments shared one folder per host.** Two deployments on one server overwrote each other, and status, logs and metrics showed the containers of all of them. Each resource now gets its own compose project under `/pango/<resourceId>`. Existing deployments under `/user` keep working.
- **A failed `docker compose up` was ignored.** For example a missing image only surfaced as a readiness timeout after 10 minutes.
- **Config issues:**
  - `AUTH_ENV_SCHEMA` validated nothing, because of a missing prefix.
  - Several compose files used env var names the code never reads.
  - The integration test harness lacked `ResourceUniqueIdService`, so CI's integration tests failed.

## Known limits

- **Networks per host.** Every compose project creates its own Docker network. A Docker host with default address pools runs out of networks after about 30 projects. The e2e target uses a larger pool of small subnets. Production hosts usually run a single deployment, so this does not matter yet.
- **Deletion test needs the compose stack.** It looks into the `docker-target` container with the Docker CLI, so it only works against the compose stack, not against staging.
