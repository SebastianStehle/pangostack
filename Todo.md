# Todo

Top improvements for Pangostack, grouped by area and ordered by priority within each group.

## Stability of deployments

### 1. Dry-run / plan mode

There is no `dryRun` anywhere today. Resolve expressions, validate parameters, and list the resources
that would be created, changed or destroyed together with the estimated price — before anything
touches a cloud account. The single biggest confidence win for both admins and end users.

### 2. Reconciliation loop for orphaned resources (implemented)

Nothing verified that provisioned infrastructure still matched what the database knows, so a failed
delete leaked a paid VM forever. A scheduled workflow now enumerates the accounts Pangostack has
credentials for and records what it cannot account for.

**Worker.** `Resource` has an optional `list(request): Promise<{ ids: string[] }>`, exposed as
`POST /resources/:type/list`. Resource types that cannot enumerate an account answer `501 Not
Implemented`. Only top level resources implement it, and only where the unique ID is stored verbatim
and can be read back: `vultr-vm` (instance label) and `aws-vm` (Name tag). `gcp-vm` and `azure-vm`
derive a lossy, truncated name from the ID, and the object stores are named by a parameter rather
than by the ID, so neither can be mapped back.

**Backend.** `reconcileOrphanedResources` runs every 6 hours on the `checks` queue:

1. `getOrphanScanGroups` returns one entry per service version and resource. Deployments that share
   both share an entry, so an account is enumerated once instead of once per deployment. Only these
   keys cross the activity boundary, so no credentials reach the Temporal history.
2. `scanOrphanGroup` resolves the credentials from `{ ...service.environment, ...version.environment }`,
   the same merge a deployment does, calls `list`, and diffs the result against the resources of every
   deployment's most recent update.
3. A `501` skips the group. Any other failure fails that group alone, because a partial view of an
   account must never turn into a finding.

**Storage.** `orphaned-resources` holds the unique ID, type, the service version and resource that
found it, `detectedAt`, `lastSeenAt` and a status of `Open`, `Ignored` or `Deleted`. There is no
foreign key to the deployment: the deployment being gone is the case being recorded, and a cascading
delete would remove the finding at the moment it becomes true. A finding that is seen again keeps the
status an admin gave it; one that is no longer at the provider is removed by the next scan of its
group, which also cleans up after a manual deletion on its own.

**Admin UI.** `/admin/orphaned-resources` lists the findings with search, paging, and a status filter
that defaults to `Open`, because the list can grow long. Each row can be ignored as a false positive
or marked as deleted by hand, and both can be reopened. There is no delete button: removing
infrastructure that Pangostack no longer tracks is too critical to automate and stays a manual task.

**Rails.**

- Only IDs matching the `deployment_<id>_<resourceId>` prefix are considered, so foreign resources in
  the same cloud account are never reported. `parseResourceUniqueId` sits next to
  `getResourceUniqueId` so the two cannot drift.
- A resource is only reported when its deployment is gone, or when it was dropped from the definition
  more than `GRACE_PERIOD_HOURS` ago, so a rollout in flight is never flagged.
- Credentials come from the service and its version, which outlive the deployments. The current
  environment wins over the one a deployment was created with, so a rotated credential is picked up. An
  account whose service version was deleted can no longer be scanned, which is the price of never
  storing credentials, and the admin page says so.
- Still open: `getResourceUniqueId` has no install scoped prefix, so two Pangostack installations that
  share one cloud account would report each other's resources. Changing the scheme later renames live
  resources, so decide it before that case appears.

### 3. Audit retry and timeout policies on maintenance workflows

`charge-deployments`, `track-deployments-healths` and all four `cleanup-*` workflows run with
`maximumAttempts: 1`. One transient database or HTTP blip silently drops a billing charge or a health
sample. Classify retryable vs. terminal errors, add backoff, and surface repeated failures to admins
instead of only to the logs.

## Functionality for end users

### 4. Live deployment progress in the portal

Stream `deployment-update-step` / `deployment-update-sub-step` state with per-step timing and logs,
plus a plain-language error summary and a "what to do next" hint. Today a failing deployment is
largely opaque to the customer.

### 5. Self-service recovery actions

`DeploymentEntity.status` is only `'Pending' | 'Created'`. Give users buttons for retry-failed-step,
redeploy, restart resource and change plan — instead of a support ticket.

### 6. One coherent deployment detail page

The data already exists (`deployment-check`, `deployment-metric`, `deployment-usage`, connection
info) but is scattered. Combine health history, metrics, cost-to-date and connection details
(downloadable SSH config and credentials) into a single screen.

### 7. Wire notifications end to end

Use the existing `notifications` domain for email and webhook delivery on deployment success,
failure, health degradation and usage or budget thresholds. Users should not have to poll the portal
to learn that their instance went down.

## Ease of use for service admins

### 8. Schema-aware definition editor

`react-ace` is already a dependency but the editor is plain text. Add inline validation, autocomplete
for resource types and expressions, and error markers on the exact line — driven by the schema from
the next item.

### 9. Publish a JSON Schema for deployment definitions

Generate it from the worker `defineResource` descriptors and `validateDefinition`, publish it at a
stable URL, and support the `yaml-language-server` `$schema` comment. Authors then get validation in
VS Code too, not only in the portal.

### 10. Version diff and staged promotion

Extend `VerifyServiceVersionButton`: show a diff between service versions, show which deployments run
which version, and allow rolling a new version out to a subset of deployments first.

### 11. Template gallery and generated resource reference

Wire the `configs/` examples into the admin UI as "create service from template", and auto-generate a
per-resource-type parameter reference from the worker descriptors so the docs cannot drift from the
code.

## Documentation and hosting

### 12. Real one-command install

`docs/HOSTING.md` currently says to copy the compose file and its `dynamicconfig/` folder out of the
repository. Ship a versioned compose file at a stable URL plus an install script that generates the
`.env` (session secret, database password). Hosting should be two commands, not a copy job.

### 13. Production hardening guide

Backup and restore for Postgres *and* Temporal, the upgrade and migration path between releases,
secret management, sizing guidance, and a ready-made Grafana dashboard for the OpenTelemetry data
that is already emitted.

### 14. Troubleshooting runbook

The common failure modes: SSH key rejected, Caddy certificate not issued, provider quota exceeded,
Temporal unreachable, stuck deployment. How to read the logs and how to recover. This is what turns
evaluators into users.

### 15. End-to-end tutorial: zero to first paying customer

Install, connect Vultr and Chargebee, author a definition, deploy, bill — with screenshots. The
concepts are documented; the single continuous happy path is not.

## New developers and promotion

### 16. Repo scaffolding for contributors

`package.json` declares MIT but there is no LICENSE file, and `.github/` contains only workflows — no
CONTRIBUTING, no code of conduct, no issue or PR templates, no `good first issue` labels. The
cheapest possible credibility fix.

### 17. Zero-credit-card development environment

Add a devcontainer / Codespaces config, seeded demo data, and a fake local resource provider so a new
contributor can run a full deployment without a cloud account. That same fake provider unlocks
end-to-end deployment tests. Note that the frontend currently has 32 stories but zero tests, so add
vitest plus testing-library and build storybook in CI.

### 18. Public demo and launch push

A hosted read-only demo instance, a three-minute screencast of a real deployment, and a rewritten
README hero (what it is, who it is for, a gif in the first screen). Then Show HN, r/selfhosted, and
the Squidex and Notifo audiences that already exist.
