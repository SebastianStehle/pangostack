# E2E Tests

Black-box tests against the Docker images of Pangostack. The API tests (vitest) talk to the backend through the generated client. The UI tests (Playwright) drive a real browser. Both run against the same docker compose stack, and that stack deploys real containers.

See [the concept](../docs/e2e-testing-concept.md) for why it is built this way.

## Run it

```bash
npm ci
npm run generate      # generates the API client from ../backend/openapi.yaml, needs Docker
npx playwright install chromium

npm run infra:build   # builds pangostack-local and pangostack-worker-local from your working copy
npm run infra:up      # starts the stack at https://localhost:8443

npm run test:api
npm run test:ui       # add --ui for Playwright UI mode

npm run infra:down    # stops the stack and deletes all data
```

You can log in at https://localhost:8443 as `admin@pango.test` / `e2e-Secret1` to look around. Your browser will warn about the self-signed certificate.

## The stack

| Service | What it does |
|---|---|
| `pango` | The backend image, which also serves the frontend |
| `worker` | The worker image |
| `postgres`, `temporal` | Infrastructure |
| `docker-target` | An SSH server with its own Docker daemon. `docker-compose-ssh` deploys to it |
| `fixtures` | Serves `definitions/compose/*.yml` to the worker |
| `proxy` | Caddy with HTTPS, needed because production cookies are secure |

The stack sets `WORKFLOW_STEP_MAX_ATTEMPTS=1`, so a failing deployment fails right away instead of retrying for about 15 minutes.

## Write a test

- **Mark each phase with a `// STEP n: ...` comment,** like the Squidex tests. Assertions follow the step they verify:

  ```ts
  // STEP 1: Create deployment.
  const { id } = await createDeployment(admin, team.id, service.service.id, { greeting: 'World' });
  await waitForDeployment(admin, id, 'Completed');

  // STEP 2: Get container logs.
  const { resources } = await admin.deployments.getDeploymentLogs(id);
  expect(resources[0].instances[0].messages).toContain('Hello World');
  ```

- **Log in through the helpers.** `createAdminClients()` uses the API key and `loginWithPassword()` returns clients with a session cookie.
- **Arrange with the API, act in the test.** The helpers in `src/shared/setup.ts` create services, users, teams and deployments.
- **Use random names and never clean up.** Do not assert global counts. Tests must pass in parallel and when run repeatedly against the same stack.
- **Wait with `waitForDeployment`, never sleep.** It fails fast with the step error when a deployment ends in the wrong state.
- **Move shared setup into hooks.** Use `beforeAll` for state that tests only read, such as a completed deployment, and `beforeEach` for state that tests change. In the UI tests, `ui/fixtures.ts` provides the admin client, a service, a team and a deployment, and `test.beforeEach` inside a `test.describe` handles the rest.
- **API: snapshot shapes, assert behaviour.** `scrub()` replaces IDs, dates and random names before `toMatchFileSnapshot`.
- **UI: only use page objects.** Tests get page objects as fixtures (`ui/fixtures.ts`) and never touch `page` directly. Page objects in `ui/pages/` hold the locators and actions; the assertions stay in the test.
- **UI: select by role and label.** Page objects use the texts from the frontend (`ui/texts.ts`). If an element has no accessible name, add an `aria-label` in the frontend rather than a CSS selector.

## Regenerate the client

The client is generated from `../backend/openapi.yaml` and is not committed. Run `npm run generate` again after the spec changed.

## Other targets

The suites only read environment variables:

| Variable | Default |
|---|---|
| `E2E_SERVER_URL` | `https://localhost:8443` |
| `E2E_API_KEY` | `e2e-api-key` |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | `admin@pango.test` / `e2e-Secret1` |
| `E2E_TIMEOUT_DEPLOYMENT` | `120000` |
| `E2E_COMPOSE_PROJECT` | `pangostack-e2e` |

The deletion test looks into the `docker-target` container with the Docker CLI, so it only works against the compose stack.
