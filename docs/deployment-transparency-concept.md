# Concept: Transparent Resource Deployment

## Problem

A deployment update currently has a single status (`Pending | Running | Completed | Failed` on `DeploymentUpdateEntity`) and a single `error` text. Everything that happens between "Running" and the final state is invisible:

- **No per-resource progress.** `deployResources` deploys resources sequentially, but the user cannot see which resource is currently being provisioned, which are done, or which failed. (The data partially exists: `resourceConnections` / `resourceContexts` are written per resource as they complete, but this is not exposed as progress.)
- **Retries are invisible.** `deployResource` retries up to 5 times with 1m backoff and a 5m timeout. A failing resource can spin for ~30 minutes while the UI shows nothing but a red "Installing" dot.
- **Deletions are invisible.** When an update removes resources, `deleteResource` runs first — the user never sees this phase.
- **No live updates.** `DeploymentPage` uses `useQuery` without `refetchInterval`; status only changes on manual reload.
- **Status regression bug.** `DeployResourceActivity` sets `update.status = 'Pending'` after the workflow already set it to `Running`, so the deployment flips back to "Pending" mid-deployment.
- **The worker is a black box.** `applyResource` is one blocking HTTP call with a 10-minute timeout; no intermediate progress or log output until the resource finishes.

## Core idea

Two levels of transparency:

1. **Steps** — one per resource action (deploy/delete), planned and persisted by the backend Temporal workflow. The backend knows the plan upfront.
2. **Sub-steps** — the phases *inside* a resource, reported live by the worker. A single resource can be huge (a Helm chart brings up many workloads; a VM goes through create → boot → setup), so the worker must expose its internal progress; the backend cannot know these phases upfront.

Persist both as first-class data, expose them via the API, and render them as a live stepper. The backend is the interesting part: once steps exist as data, the UI is mostly presentation.

## Backend

### 1. Data model: `DeploymentUpdateStepEntity`

New entity (follows the existing `deployment-check` / `deployment-log` pattern) instead of another `simple-json` column — append-only, queryable, keeps history per attempt:

```ts
@Entity({ name: 'deployment-update-steps' })
export class DeploymentUpdateStepEntity {
  id: number;
  updateId: number;            // FK -> deployment-updates, CASCADE
  resourceId: string;          // id from the service definition
  resourceName: string;        // resolved display name
  action: 'Deploy' | 'Delete';
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  attempt: number;             // Temporal activity attempt
  error?: string;
  startedAt?: Date;
  completedAt?: Date;

  @Column('simple-json', { default: [] })
  subSteps: DeploymentSubStep[]; // reported by the worker, see below
}

export type DeploymentSubStep = {
  name: string;                // e.g. 'Waiting for workloads'
  status: 'Running' | 'Completed' | 'Failed';
  message?: string;            // e.g. '3/5 pods ready'
  startedAt: string;
  completedAt?: string;
};
```

Steps are relational (plannable, queryable, per-attempt history); sub-steps are a JSON column because they are dynamic, worker-defined, and never queried individually — the whole array is replaced on each progress sync.

Migration via `npm run typeorm:generate-migrations AddDeploymentUpdateSteps`, then register it in `app.module.ts` (migrations are explicit). Use `IsEnum` for the DTO enums.

### 2. Workflow changes (`deploy-resources.ts`)

1. **Plan upfront.** New activity `createDeploymentSteps` runs first and inserts all steps as `Pending` — deletions of removed resources and deployments in order. The UI can immediately show the full plan ("5 steps, 0 done").
2. **Step transitions in the activities.** `DeployResourceActivity` / `DeleteResourceActivity` mark their step `Running` on entry (setting `startedAt` and `attempt` from `Context.current().info.attempt` — this makes Temporal retries visible as "attempt 3 of 5") and `Completed` on success. Because activity code may not run on the final failure, the workflow's `catch` block calls a small `failDeploymentStep` activity to mark the current step `Failed` with the error.
3. **Fix the regression.** Remove the `update.status = 'Pending'` write in `DeployResourceActivity`.
4. **Heartbeats.** The deploy activity should heartbeat while waiting on the worker so Temporal can distinguish "slow provisioning" from "stuck", enabling a shorter heartbeat timeout and faster retry on dead workers.

Determinism is preserved: all I/O stays in activities; the workflow only orchestrates.

### 3. API (CQRS + controller)

New query `GetDeploymentUpdateSteps` in the services domain with a `@QueryHandler`, dispatched from a thin endpoint in `deployments.controller.ts`:

```
GET api/deployments/:deploymentId/updates/:updateId/steps -> DeploymentUpdateStepsDto
```

Step DTO: `resourceId`, `resourceName`, `action`, `status`, `attempt`, `maxAttempts` (constant, from the retry policy), `error`, `startedAt`, `completedAt`, `subSteps` (name, status, message, timestamps). A separate endpoint (rather than embedding in `DeploymentDto`) keeps the deployment payload small and lets the frontend poll steps independently at a higher frequency.

Also expose the **update history**: the `deployment-updates` rows (status, `createdBy`, `createdAt`, service version) already contain everything for an audit trail; they just need a query + endpoint.

After controller changes: run the backend, `npm run generate-api` in frontend/, then lint.

### 4. Worker: sub-steps inside a resource

Today `applyResource` is one blocking HTTP call (up to 10 minutes) and each provisioner is a black box — yet all four have clear internal phases with existing wait loops (`pollUntil`, `waitForInstance`):

| Provisioner | Natural sub-steps |
|---|---|
| `helm` | Add/update repo → `helm upgrade --install` → **wait for workloads ready** |
| `docker-compose-ssh` | Wait for SSH → upload files → `compose up` → wait for containers |
| `vultr-vm` | Create instance → wait for active → run setup |
| `vultr-storage` | Create bucket → configure access |

**Transport: stream progress on the apply call itself.** Instead of a side-channel store that the backend polls, the apply request becomes a **streaming HTTP response** (NDJSON, one event per line — SSE-style over the connection that already exists):

Each line is a concrete, self-contained event discriminated by a **verb** `type`. Steps are reported as discrete lifecycle events carrying their own `id`, not as repeated full-array snapshots — the backend reconstructs whatever shape it needs (an ordered sub-step array, for the UI) from them:

```
POST /deployment/apply           (streaming response)

{"type":"startStep","id":"1","name":"Installing chart","startedAt":"..."}
{"type":"appendLog","stepId":"1","message":"..."}                        // a log line under step 1
{"type":"updateConnection","connection":{ "namespace": { ...ConnectInfo } }}
{"type":"updateContext","context":{ "host":"1.2.3.4" }}
{"type":"updateResourceContext","resourceContext":{ "password":"..." }}
{"type":"completeStep","id":"1","completedAt":"..."}
{"type":"startStep","id":"2","name":"Waiting for workloads","startedAt":"..."}
{"type":"appendLog","stepId":"2","message":"1/3 replicas ready"}
{"type":"appendLog","stepId":"2","message":"3/3 replicas ready"}         // every line kept, none replaced
{"type":"completeStep","id":"2","completedAt":"..."}
{"type":"complete"}                                                      // terminal success marker
{"type":"fail","error":"..."}                                            // or terminal failure (+ a failStep for the current step)
```

There is no aggregate `result` event. Everything `apply` produces — steps, log lines, context, connection and resource-context — is emitted **incrementally** through a `ResourceReporter` and persisted by the backend as it arrives, so a failure in a later step never discards what an earlier step already reported (e.g. a VM's generated password is persisted before the SSH wait that might time out). `apply` therefore returns `void`; the terminal `complete` event distinguishes a clean finish from a dropped connection.

Why this over a progress store: there is **no state at the worker** to lose, expire, or clean up — progress lives exactly as long as the operation; event ordering is guaranteed; and a dropped connection is an unambiguous failure that Temporal's existing activity retry handles (apply must already be idempotent because of those retries). A store-and-poll design would silently show stale progress after a worker restart.

**Why not gRPC:** server-streaming gRPC is the textbook fit, but the worker↔backend contract is currently Swagger-driven (`/api-json` → `npm run generate-worker`), and introducing a proto toolchain, a second port, and new auth handling for one streaming endpoint isn't worth it. NDJSON over the existing HTTP/REST channel gets the same semantics with the current infrastructure. If more streaming use cases appear (live logs, status watches), revisit gRPC as a deliberate migration.

One practical consequence: the generated OpenAPI client can't consume a streaming body, so `WorkerClient` gets one hand-written streaming method for apply (in `backend/src/domain/workers/`, next to — not inside — the generated folder). The *event shapes* are still generated, though: each concrete `*EventDto` is registered on the worker controller with `@ApiExtraModels` and combined into a proper `oneOf` **discriminated union** `ResourceEventDto` (assembled in `main.ts`), so they land in the OpenAPI spec and the generator emits a real TypeScript union the backend switches on — even though the endpoint itself is `@ApiExcludeEndpoint`. All other endpoints stay fully generated.

**Resource reporter.** `Resource.apply` gets a `ResourceReporter` — the single output sink; provisioners do not log separately, so no `LogContext` is threaded through:

```ts
interface ResourceReporter {
  beginStep(name: string): void;                              // completes the previous sub-step, starts a new one
  report(message: string, options?: { log?: boolean }): void; // appends a log line to the current step
  updateContext(context: Record<string, string | number | boolean>): void;
  updateResourceContext(resourceContext: Record<string, string>): void;
  updateConnection(connection: Record<string, ConnectionInfo>): void;
}
```

The reporter assigns each step an id and emits `startStep`/`completeStep`/`failStep`. `report` emits a single `appendLog` event (carrying the current `stepId`) — there is no separate "live message" that gets replaced; every line is kept. `{ log: true }` additionally writes the line to the worker's own NestJS logger for operators. The setters emit the matching `update*` events.

**Backend side.** `DeployResourceActivity` consumes the stream: each event heartbeats Temporal and updates the sub-step array on the step row (throttled to ~1 write/s). This also enables a much better timeout policy: instead of one blanket 10-minute timeout, fail fast when the stream is silent too long (idle timeout per sub-step, with the worker emitting keep-alives during long waits). Failures surface as the exact sub-step that broke, with its message — not an opaque timeout.

**Helm readiness is verification, not decoration.** Resources deploy sequentially and later resources consume the context/connections of earlier ones — so `apply` returning successfully must mean "this resource is usable by its dependents". Today helm's `apply` returns right after `helm upgrade --install`, when pods may still be crash-looping. The "wait for workloads" phase (reusing the readiness logic from `getStatus`) therefore goes **inside `apply` as part of its success condition**: not ready within the timeout → the step fails. The sub-step reporting (`n/m pods ready`) is the transparent view of that verification, not a separate feature. The same principle applies to `docker-compose-ssh` (wait until containers are healthy, not just started).

After DTO changes: run the worker, `npm run generate-worker` in backend/.

### 5. Live updates

Polling is sufficient — deployments run minutes, not milliseconds. `useQuery` with a conditional `refetchInterval` (e.g. 3–5s while the update status is `Pending`/`Running`, disabled otherwise) for both the deployment and the steps query. SSE/WebSocket push via the notifications domain is a possible later optimization, but adds infra for little gain.

## UI

On `DeploymentPage` (overview tab), replace the generic "deploying" alert with:

- **Progress bar** (daisyUI `progress`): completed steps / total, with "Deploying resource 2 of 5: postgres".
- **Step timeline** (daisyUI `steps`/`timeline`): one row per step — status icon, resource name, action (deploy/delete), duration, an "attempt n/5" badge when `attempt > 1`, and for failed steps the error inline plus the existing per-resource log (`update.log[resourceId]`, currently only visible indirectly).
- **Sub-steps:** the active step is expanded by default, showing its live sub-steps with the current message ("Waiting for workloads — 3/5 pods ready"). Completed steps collapse to a summary but stay expandable, so the full trace of what happened inside each resource remains inspectable after the fact.
- **Failed state:** highlight the failed step and offer a retry action (dispatches a new update through the existing coordinator signal path).
- **Update history section:** table of past updates (when, who, version, status).

Sanitization note: step errors originate from provisioners and may leak infrastructure details (hosts, internal IDs). Reuse the `isPublic` idea from `ConnectionInfo`: store the raw error, expose a sanitized message to customers, full detail in the admin UI.

## Phasing

| Phase | Scope | Schema change |
|---|---|---|
| 1 | `refetchInterval` polling; fix status-regression bug; coarse progress inferred from `resourceConnections` keys | none |
| 2 | Step entity + migration; workflow/activity transitions incl. attempt tracking; steps + history endpoints; stepper UI with progress bar | yes |
| 3 | Worker sub-steps: `ResourceReporter` in all provisioners, streaming apply endpoint, backend polling/heartbeat, helm readiness wait, expandable sub-step UI | worker DTOs |
| 4 | Error sanitization; retry button; SSE if polling ever becomes a limit | none |

Phases 2 and 3 together are the actual concept; 2 ships standalone value and 3 builds on its persistence without rework (sub-steps land in the column phase 2 created).

## Files touched (phases 2–3)

- `backend/src/domain/database/entities/deployment-update-step.ts` (new) + generated migration + `app.module.ts`
- `backend/src/domain/workflows/workflows/deploy-resources.ts`, `activities/deploy-resource.ts`, `activities/delete-resource.ts`, new `activities/create-deployment-steps.ts`, `activities/fail-deployment-step.ts`
- `backend/src/domain/services/use-cases/get-deployment-update-steps.ts` (new query/handler)
- `backend/src/controllers/deployments/deployments.controller.ts` + DTOs
- `worker/src/resources/interface.ts` (`ResourceReporter`, `ResourceEvent`), all four provisioners in `worker/src/resources/*/index.ts`, `worker/src/controllers/deployment/` (streaming apply response + `ResourceEventDto`)
- `backend/src/domain/workers/` (hand-written streaming apply client next to `generated/`), `frontend/src/api/generated/` (regenerated)
- `frontend/src/pages/public/team/deployment/DeploymentPage.tsx`, new `frontend/src/components/DeploymentSteps.tsx`

## Open questions

- Streaming through reverse proxies: worker and backend may sit behind proxies that buffer responses — the worker must set `X-Accel-Buffering: no` / flush per event, and a keep-alive interval (e.g. every 15s during long waits) needs to be chosen.
- Should `deleteResource` stream too? Deletions are usually fast; probably keep them blocking initially and reuse the mechanism only if slow deletes show up.
- Migration note: readiness-as-success is a semantic change — deployments that today report `Completed` with crash-looping pods will report `Failed`. Intended, but worth announcing.

- Should steps of old updates be retained indefinitely or cleaned up like checks/metrics (`cleanup-deployments-*` workflows)?
- Is `maxAttempts` worth surfacing to customers, or admin-only?
- Does the retry action create a new `DeploymentUpdateEntity` or re-signal the existing one? (New update is simpler and keeps history linear.)
