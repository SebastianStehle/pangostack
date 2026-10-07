# Todo

The living roadmap for Pangostack. Focus: **single-tenant SaaS for small vendors, no Kubernetes required.** The reasoning behind the priorities is in [compare.md](compare.md).

## How to use this document

- Items are sorted by **value for effort**. Pick from the top unless a dependency blocks it.
- Every item has a **status**, an **effort**, a **why**, a **scope**, an **approach** with pointers into the code, and **done when** criteria.
- When you start an item, set it to `In progress` and add your name. When you finish it, tick the criteria, move a short summary to [Done](#done) and add a line to the [Changelog](#changelog).
- Write down decisions you make under **Open questions**, so the next person does not have to rediscover them.
- New ideas go to [Inbox](#inbox) first. Sort them into a tier once they have a why and an effort.

| Status | Meaning |
|---|---|
| `Open` | Not started |
| `In progress` | Someone is working on it |
| `Blocked` | Waiting for a dependency or a decision |
| `Done` | Shipped, moved to [Done](#done) |

Effort: **S** = up to 2 days, **M** = up to 2 weeks, **L** = more than 2 weeks.

## Overview

| # | Item | Tier | Effort | Status | Depends on |
|---|---|---|---|---|---|
| 1 | Retry and timeout policies | Quick win | S | Done | |
| 2 | Install-scoped resource prefix | Quick win | S | Open | |
| 3 | Repo scaffolding | Quick win | S | Open | |
| 4 | One-command install | Quick win | S | Open | |
| 5 | JSON Schema for definitions | Quick win | S | Open | |
| 6 | Readable errors and live progress | Quick win | S | Open | |
| 7 | Troubleshooting runbook | Quick win | S | Open | |
| 8 | Backups with Vultr snapshots | Core | M | Open | |
| 9 | Dry run / plan | Core | M | Open | |
| 10 | Stripe billing provider | Core | M | Open | |
| 11 | Self-service recovery | Core | M | Open | 6 |
| 12 | Notifications | Core | M | Open | |
| 13 | Free trials | Core | M | Open | |
| 14 | Template gallery and resource reference | Core | M | Open | 5 |
| 15 | Backups for AWS, GCP and Azure | Growth | M each | Open | 8 |
| 16 | Version lifecycle and staged rollouts | Growth | L | Open | 9, 12 |
| 17 | One deployment detail page | Growth | M | Open | 6, 8 |
| 18 | CLI | Growth | M | Open | 5, 9 |
| 19 | Schema-aware definition editor | Growth | M | Open | 5 |
| 20 | Margin dashboard | Growth | M | Open | |
| 21 | Zero-credit-card dev environment | Growth | M | Open | |
| 22 | Production hardening guide | Growth | M | Open | 4 |
| 23 | Tutorial: zero to first paying customer | Growth | M | Open | 4 |
| 24 | Public demo and launch | Growth | M | Open | 22, 23 |
| 25 | More low-cost providers | Bigger bet | M each | Open | |
| 26 | Orphan detection coverage | Bigger bet | M | Open | |
| 27 | Managed domains | Bigger bet | L | Open | |
| 28 | Restic backups | Bigger bet | L | Open | 8 |
| 29 | Lightweight BYOC | Bigger bet | L | Open | 2 |

---

## Tier 1: Quick wins

### 1. Retry and timeout policies

`Status: Done` · `Effort: S`

**Why.** Most maintenance workflows ran their activities with `maximumAttempts: 1`. One database or HTTP blip silently drops a billing charge, a health sample or a cleanup. Billing is the worst case: a missed `charge-deployments` run means lost revenue.

**Scope.**
- `charge-deployments`, `track-deployments-healths`, `track-deployments-metrics`, `track-deployments-usage` and all `cleanup-*` workflows in `backend/src/domain/workflows/workflows/`.

**Approach.**
- Give activities a retry policy with exponential backoff (e.g. 5 attempts, starting at 30s). Use named constants, like `DEPLOYMENT_STEP_MAX_ATTEMPTS` in `../constants`.
- Mark terminal errors as non-retryable (`ApplicationFailure.nonRetryable`), for example a deployment that no longer exists.
- Charging must be idempotent before it can be retried. Check that `chargeDeployment` in `chargebee-billing.service.ts` cannot charge the same period twice, e.g. by tracking the billed period in `billed-deployment`.
- Surface repeated failures to admins (admin dashboard or notification), not only to the logs.

**Done when.**
- [x] No maintenance workflow uses `maximumAttempts: 1` without a written reason.
- [x] A retried charge never charges twice. Chargebee idempotency keys per item and period; there is no automated test against Chargebee.
- [x] Repeated failures are visible to admins (billing only, see below).

**Outcome.**
- Policies live in `backend/src/domain/workflows/constants.ts`:
  - `TRACKING_RETRY_POLICY`: 3 attempts from 10s.
  - `CLEANUP_RETRY_POLICY`: 5 attempts from 30s.
  - `BILLING_RETRY_POLICY`: 8 attempts from 1m, capped at 30m, about 1.5 hours.
  - All three treat `NotFoundException` and `BadRequestException` as non-retryable.
- Chargebee charges send an idempotency key per deployment, period and item.
- `billed-deployment` now has `deploymentId` in its primary key. Before, it remembered only one deployment per month.
- Admins (built-in Admin group) are subscribed to the Notifo topic `admins`. `chargeDeployments` sends one `BILLING_FAILED` summary per run when deployments fail after all retries.

**Open questions.**
- Failed health, metric and cleanup runs still only reach the logs. Add an admin dashboard widget or `admins` notifications for them as part of item 12?
- Chargebee keeps idempotency keys for a limited time; check the window if the billing retries are ever extended.

---

### 2. Install-scoped resource prefix

`Status: Open` · `Effort: S`

**Why.** `getResourceUniqueId` in `backend/src/domain/services/libs/index.ts` builds `deployment_<id>_<resourceId>`. Two Pangostack installations sharing one cloud account produce colliding names, and their orphan scans would report each other's resources. Changing the scheme later renames live resources, so it has to be decided now while it is cheap.

**Approach.**
- Add an optional `INSTALL_ID` env var (added to the matching Joi schema) and build `<installId>_deployment_<id>_<resourceId>`.
- Keep the old scheme when `INSTALL_ID` is not set, so existing installations do not rename anything.
- Update `parseResourceUniqueId` next to it; the comment there explains why both must never drift.
- Check name length limits per provider (GCP and Azure already truncate).

**Done when.**
- [ ] New installs can set an install ID; existing installs are unaffected.
- [ ] Orphan scans only report resources of their own install (test).

**Open questions.**
- Make `INSTALL_ID` required for new installs via the install script (item 4)?

---

### 3. Repo scaffolding

`Status: Open` · `Effort: S`

**Why.** `package.json` declares MIT but there is no LICENSE file, and `.github/` only contains workflows. It's the cheapest credibility fix there is.

**Scope.**
- `LICENSE` (MIT), `CONTRIBUTING.md` (setup, lint, tests, PR rules; reuse the README sections), `CODE_OF_CONDUCT.md`.
- Issue templates (bug, feature) and a PR template.
- `good first issue` labels on a handful of small items from this list.

**Done when.**
- [ ] GitHub shows the license and community profile as complete.

---

### 4. One-command install

`Status: Open` · `Effort: S`

**Why.** [docs/HOSTING.md](docs/HOSTING.md) tells people to copy the compose file and its `dynamicconfig/` folder out of the repository and to edit secrets by hand. Every manual step loses evaluators.

**Approach.**
- Publish a versioned compose file (and `dynamicconfig/`) as a release asset at a stable URL.
- Write an `install.sh` that downloads them, asks for the domain, generates `SESSION_SECRET`, the Postgres password and the install ID (item 2), and writes `.env`.
- Move the hardcoded defaults out of the compose file into `.env`.

**Done when.**
- [ ] A fresh server runs Pangostack with `curl … | sh` plus `docker compose up -d`.
- [ ] No secret has a usable default.

---

### 5. JSON Schema for definitions

`Status: Open` · `Effort: S`

**Why.** Definition authors only get validation when they save in the admin UI. A schema gives them validation and autocomplete in VS Code, and it is the foundation for the editor (19), the CLI (18) and the reference docs (14).

**Approach.**
- Generate the schema from the class-validator classes in `backend/src/domain/definitions/index.ts`, plus the resource descriptors from `defineResource` in the worker (parameters per resource type).
- Serve it from the backend at a stable URL (e.g. `/api/schema/definition.json`) and also publish it with each release.
- Document the `# yaml-language-server: $schema=…` comment in [docs/DEFINITIONS.md](docs/DEFINITIONS.md) and add it to the files in `configs/`.

**Done when.**
- [ ] All files in `configs/` validate against the schema.
- [ ] VS Code shows errors for an unknown resource type or a missing required parameter.

---

### 6. Readable errors and live progress

`Status: Open` · `Effort: S`

**Why.** The step and sub-step data from [docs/deployment-transparency-concept.md](docs/deployment-transparency-concept.md) already exists (`deployment-update-step`, `deployment-update-sub-step`). What is missing is presenting it so that a customer understands what is happening and what to do when it fails.

**Approach.**
- Show per-step duration and the current attempt (retries are otherwise invisible).
- Map common errors to plain language with a next-step hint, e.g. provider quota exceeded, SSH rejected, health check failing because DNS is not set up.
- Keep the raw error behind a "details" toggle.
- Check that `refetchInterval` in `frontend/src/pages/public/team/deployment/DeploymentPage.tsx` covers all running states.

**Done when.**
- [ ] A failing deployment shows which step failed, why in one sentence, and what to do next.

---

### 7. Troubleshooting runbook

`Status: Open` · `Effort: S`

**Why.** It turns evaluators into users and reduces support load.

**Scope.** A `docs/TROUBLESHOOTING.md` that covers:
- SSH key or password rejected
- Caddy certificate not issued
- Provider quota exceeded
- Temporal unreachable
- A stuck deployment: find it in the Temporal UI, terminate it, retry

For each problem: symptoms, how to read the logs, and how to recover.

**Done when.**
- [ ] Linked from the README, HOSTING.md and the error hints from item 6.

---

## Tier 2: Core features

### 8. Backups with Vultr snapshots

`Status: Open` · `Effort: M`

**Why.** A dedicated instance without restorable backups is hard to sell, and it is the most visible gap compared with Omnistrate. Native provider snapshots need no SSH, no agents and no volume conventions, and they fit the existing resource model.

**Scope.**
- Vultr only. Other providers follow in item 15, restic in item 28.
- Backups of the VM disk. Crash-consistent is enough for Postgres, MongoDB (WiredTiger) and Redis with AOF.

**Approach.**
- **Backup.** `vultr-vm` already passes a `backup` flag (`worker/src/resources/vultr-vm/index.ts`). Keep using Vultr's automatic backups.
- **List.** Add an optional `listBackups(id, request)` to the `Resource` interface in `worker/src/resources/interface.ts`. Expose it in `controllers/resources/` and regenerate the backend worker client.
- **Restore into a new deployment.** Add an optional `snapshotId` parameter to `vultr-vm`. When it is set, the VM is created from the snapshot instead of the OS image. `docker-compose-ssh` then runs as usual and starts the existing volumes.
- **Survive deletion.** Vultr deletes automatic backups together with the instance (verify in the Vultr docs). So `delete` of `vultr-vm` takes a final manual snapshot when backups are enabled, and records it so it can be listed and restored for N days.
- **Backend.**
  - A query that lists backups per deployment.
  - A "restore into new deployment" command that creates a deployment with the old parameters plus `snapshotId`.
  - A cleanup schedule for final snapshots after N days.
- **Portal.** Backups section on the deployment page with a "restore into new deployment" button.
- **Pricing.** Already possible with `target: ${parameters.backup}, test: 'true'`. Add the snapshot cost to the example definitions.

**Done when.**
- [ ] A customer can list backups and restore one into a new deployment that passes its health check.
- [ ] A deleted deployment with backups enabled can still be restored for N days.
- [ ] Final snapshots are deleted after N days.

**Open questions.**
- How long do we keep final snapshots (N)? Configurable per service?
- Does the restored deployment get a new subscription, or does it take over the old one?

---

### 9. Dry run / plan

`Status: Open` · `Effort: M`

**Why.** Nothing shows what an update will do before it touches a cloud account. It's the biggest confidence win for admins and customers alike. Also, broken expressions currently evaluate to an empty string ([docs/DEFINITIONS.md](docs/DEFINITIONS.md)), so mistakes are discovered at deploy time.

**Approach.**
- A `PlanDeployment` query (CQRS, in `backend/src/domain/services/use-cases/`) that reuses `evaluateParameters`, `evaluatePrices` and `evaluateUsage` from `backend/src/domain/definitions/index.ts`.
- Compare against the previous update's resources (the same diff `deployResources` already computes) and return created, changed (with parameter diff), deleted and recreated resources, plus old and new price.
- Values from `context.*` are unknown before deployment. Show them as `(known after apply)`, like Terraform.
- Make expression errors explicit: `evaluateExpression` in `backend/src/lib/helpers/expression.ts` should report which expression failed instead of returning an empty string. In a plan they are errors; at deploy time they should at least be logged.
- **Admin UI:** plan a version against a sample parameter set before saving.
- **Portal:** show the plan in the update dialog before the customer confirms.

**Done when.**
- [ ] A customer sees what will be created, changed or deleted and the price change before confirming an update.
- [ ] An invalid expression is reported with its location when saving a version.

---

### 10. Stripe billing provider

`Status: Open` · `Effort: M`

**Why.** Most small SaaS vendors use Stripe, not Chargebee. Supporting it probably matters more for adoption than any infrastructure feature.

**Approach.**
- Implement `BillingService` from `backend/src/domain/billing/interface.ts` next to `chargebee/` and `noop/`:
  - `createSubscription` maps to Stripe Checkout.
  - `getBillingPortalLink` maps to the Customer Portal.
  - `chargeDeployment` creates invoice items or usage records.
  - `getInvoices` lists Stripe invoices.
- Map `billingIdentifier` to Stripe prices. Document how to set them up.
- Add a Joi env schema and select the provider via config.

**Done when.**
- [ ] The full flow (checkout, deploy, monthly charge, invoice in the portal) works in Stripe test mode.
- [ ] HOSTING.md documents the setup.

**Open questions.**
- Webhooks for failed payments: suspend the deployment, or only notify?

---

### 11. Self-service recovery

`Status: Open` · `Effort: M` · `Depends on: 6`

**Why.** Today customers need a support ticket when something goes wrong. `DeploymentEntity.status` only knows `Pending` and `Created`.

**Scope.**
- **Retry failed step.** A `retry-deployment` use case already exists. Expose it clearly in the portal next to the failed step.
- **Redeploy:** re-run the current update.
- **Restart resource:** `docker compose restart`, or a VM reboot via the provider API. This needs a new optional `restart` operation on `Resource`.
- **Change plan:** already possible via update; make it discoverable.

**Done when.**
- [ ] A customer can recover from a failed deployment and a hanging app without contacting support.

---

### 12. Notifications

`Status: Open` · `Effort: M`

**Why.** Customers should not have to poll the portal to learn that their instance went down. The `notifications` domain (Notifo) exists but only covers team events.

**Approach.**
- Events: deployment succeeded or failed, health degraded or recovered, backup failed (8), upgrade scheduled (16), usage or budget threshold reached.
- Channels: email and webhook, through Notifo where possible.
- Health notifications fire on state changes only, not on every 15-minute check.

**Done when.**
- [ ] A team gets an email within one check interval when its deployment's health degrades.

---

### 13. Free trials

`Status: Open` · `Effort: M`

**Why.** Trials are the standard sales tool for SMB SaaS. They're cheap to build because billing and cleanup workflows already exist.

**Approach.**
- Definition: `trial: { days: 14 }` on the service. Check the price rules too, so trials can be limited to small plans.
- Deploy without a subscription and record `trialEndsAt` on the deployment.
- Remind the customer before expiry (12). At expiry, either convert via `createSubscription` or delete the deployment through the existing coordinator.
- Limit to one trial per team per service.

**Done when.**
- [ ] A customer can start a trial without paying, gets reminded, and the deployment is converted or removed automatically.

---

### 14. Template gallery and resource reference

`Status: Open` · `Effort: M` · `Depends on: 5`

**Why.** Writing the first definition is the hardest step for a new vendor. Ready-made templates also make Pangostack the go-to tool for "sell a hosted version of your open-source app."

**Approach.**
- "Create service from template" in the admin UI, using the files in `configs/`.
- Add templates for common self-hostable apps, starting with the ones that run well on one VM.
- Generate a parameter reference per resource type from the worker descriptors, so docs cannot drift from the code.

**Done when.**
- [ ] An admin can create a working service from a template without writing YAML.

---

## Tier 3: Growth

### 15. Backups for AWS, GCP and Azure

`Status: Open` · `Effort: M each` · `Depends on: 8`

**Why.** Same value as item 8 for the other clouds.

**Approach.** Repeat the three pieces from item 8 per provider:

| Provider | Scheduled backups | Restore |
|---|---|---|
| AWS | EBS snapshots via Data Lifecycle Manager or AWS Backup | Volume from snapshot |
| GCP | Snapshot schedule policy on the disk | Disk from snapshot |
| Azure | Disk snapshots or Azure Backup | Managed disk from snapshot |

For each: list, restore via `snapshotId`, final snapshot on delete. Check per provider whether snapshots survive deletion of the VM.

**Done when.**
- [ ] The same acceptance criteria as item 8, per provider.

---

### 16. Version lifecycle and staged rollouts

`Status: Open` · `Effort: L` · `Depends on: 9, 12`

**Why.** Once a vendor has more than a handful of deployments, upgrading them one by one does not scale, and upgrading all at once is risky.

**Approach.**
- **Version state:** `Active`, `Preferred` or `Deprecated` on `service-version`. New deployments use the preferred version; deprecated versions cannot be selected.
- **Version diff** in the admin UI: definition diff, plus which deployments run which version.
- **Rollout workflow:**
  - A new Temporal workflow that signals the existing `deploymentCoordinator` per deployment, in batches.
  - It waits for each batch's health checks and pauses on failure.
  - Admins can pause, resume or cancel a rollout.
- **Maintenance windows:** optional per deployment. The rollout waits for the window.
- **Notifications** (12): announce before the upgrade, report after it.

**Done when.**
- [ ] An admin can roll a new version out to 10% of deployments, see the health result, then continue to all.
- [ ] A failing batch stops the rollout automatically.

**Open questions.**
- Can customers opt out of or delay upgrades?

---

### 17. One deployment detail page

`Status: Open` · `Effort: M` · `Depends on: 6, 8`

**Why.** The data exists (`deployment-check`, `deployment-metric`, `deployment-usage`, connection info, steps, backups) but is scattered.

**Scope.**
- One screen with health history, metrics, cost to date, backups and connection details.
- Connection details include a downloadable SSH config and credentials.

**Done when.**
- [ ] A customer finds everything about one deployment without switching pages.

---

### 18. CLI

`Status: Open` · `Effort: M` · `Depends on: 5, 9`

**Why.** Vendors want to release service versions from CI, not by pasting YAML into a UI.

**Approach.**
- Go is already planned for the CLI (README). Commands:
  - `pango login`
  - `pango version push --service <id> --file definition.yml [--dry-run]`
  - `pango deployments list`
- Authenticate with an API key; user API keys already exist (`AUTH_INITIAL_USER_API_KEY`).
- Publish a GitHub Action that wraps `version push`.

**Done when.**
- [ ] A GitHub workflow can validate and publish a service version.

---

### 19. Schema-aware definition editor

`Status: Open` · `Effort: M` · `Depends on: 5`

**Why.** The definition editor is plain text. `react-ace` is already a dependency.

**Scope.** Inline validation, autocomplete for resource types, parameters and `${…}` expression roots, and error markers on the exact line, all driven by the schema from item 5.

**Done when.**
- [ ] An unknown resource type is underlined before saving.

---

### 20. Margin dashboard

`Status: Open` · `Effort: M`

**Why.** Pangostack's pitch is profitable hosting (~60% margin). Vendors should see it.

**Approach.**
- Add an optional `cost` to price rules or mappings (provider cost per hour of a plan), and the snapshot cost from item 8.
- Show revenue and cost per deployment and per service, plus the margin, in the admin UI.

**Done when.**
- [ ] An admin sees the monthly margin per service.

**Open questions.**
- Read provider costs from billing APIs, or keep them declared in the definition? Declared is simpler and good enough to start.

---

### 21. Zero-credit-card dev environment

`Status: Open` · `Effort: M`

**Why.** New contributors cannot run a full deployment without a cloud account, and there are no end-to-end deployment tests.

**Scope.**
- A devcontainer / Codespaces config and seeded demo data.
- A `fake-vm` resource in the worker that simulates create, update and delete with configurable delays and failures.
- End-to-end tests of the deployment workflow against the fake resource.
- The frontend has 32 stories but no tests: add vitest with testing-library, and build Storybook in CI.

**Done when.**
- [ ] A new contributor deploys a fake service within 15 minutes of cloning.

---

### 22. Production hardening guide

`Status: Open` · `Effort: M` · `Depends on: 4`

**Scope.** A `docs/PRODUCTION.md` that covers:
- Backup and restore of Postgres **and** Temporal
- The upgrade and migration path between releases
- Secret management
- Sizing guidance
- A ready-made Grafana dashboard for the OpenTelemetry data that is already emitted

**Done when.**
- [ ] An operator can restore a Pangostack install from backup by following the guide.

---

### 23. Tutorial: zero to first paying customer

`Status: Open` · `Effort: M` · `Depends on: 4`

**Scope.** One continuous, hands-on path with screenshots:
1. Install
2. Connect Vultr and a billing provider
3. Write a definition
4. Deploy
5. Bill

The concepts are documented; the single happy path is not.

**Done when.**
- [ ] Someone unfamiliar with Pangostack completes it without help.

---

### 24. Public demo and launch

`Status: Open` · `Effort: M` · `Depends on: 22, 23`

**Scope.**
- A hosted read-only demo instance.
- A three-minute screencast of a real deployment.
- A rewritten README hero: what it is, who it is for, a gif on the first screen.
- Then Show HN, r/selfhosted, and the existing Squidex and Notifo audiences.

---

## Tier 4: Bigger bets

### 25. More low-cost providers

`Status: Open` · `Effort: M each`

**Why.** Cheap providers are Pangostack's cost advantage.

**Scope.**
- Hetzner and DigitalOcean resources (VM and object storage), implementing `Resource` with `list` (for orphan detection) from the start.
- Register them in the resource map.
- Add metrics sources like `vultr-vm` has.

**Done when.**
- [ ] `configs/` has a working example per provider.

---

### 26. Orphan detection coverage

`Status: Open` · `Effort: M`

**Why.** Orphan detection only works for `vultr-vm` and `aws-vm`.
- `gcp-vm` and `azure-vm` derive a lossy, truncated name from the ID.
- The object stores are named by a parameter rather than by the ID.

**Approach.**
- Store the full unique ID as a label or tag on GCP and Azure VMs and read it back in `list`.
- For storage resources, tag buckets with the unique ID.

**Done when.**
- [ ] Every resource type implements `list`, or documents why it cannot.

---

### 27. Managed domains

`Status: Open` · `Effort: L`

**Why.** The DNS step in `afterInstallationInstructions` is the most common manual onboarding step.

**Approach.**
- A `dns-record` resource that creates `<name>.<vendor-domain>` via the DNS provider API (Cloudflare first). It outputs the hostname in the context.
- Caddy on the VM issues the certificate as before.
- Customers can add their own domain later, with a CNAME check.

**Done when.**
- [ ] A deployment is reachable via HTTPS without any manual DNS step.

---

### 28. Restic backups

`Status: Open` · `Effort: L` · `Depends on: 8`

**Why.** Adds what native snapshots cannot do: application-consistent dumps, restore across providers, and customer download.

**Approach.**
- **Definition:** a `backup` block on `docker-compose-ssh` with `interval`, `keep`, `stop` and the hooks `preBackup` / `postRestore`.
- **Backup** runs restic in a container on the VM over SSH, covering the project's named volumes, to the vendor's S3. One repository per deployment.
- **List and prune** run in the worker directly against S3, so they work after the VM is gone.
- **Restore** happens in the first `apply` of a new deployment. Track it in the resource context so it runs only once.
- **Password:** the per-deployment restic password is stored encrypted in the database, never in workflow arguments.

**Done when.**
- [ ] The same restore flow as item 8 works across providers, and a customer can download a backup.

---

### 29. Lightweight BYOC

`Status: Open` · `Effort: L` · `Depends on: 2`

**Why.** Some customers want the instance in their own cloud account. Full enterprise BYOC (cross-account roles, agents, PrivateLink) is out of scope.

**Approach.**
- A team-owned "cloud account" entity with encrypted credentials.
- Resources reference it as `${account.apiKey}` instead of `${env.apiKey}`, and the service decides whether BYOC is allowed.
- Orphan scans run per account. Credentials never reach the Temporal history.

**Done when.**
- [ ] A customer deploys into their own Vultr or AWS account, and deleting the deployment cleans up everything there.

---

## Not planned

These would raise the cost per tenant and the complexity, which works against Pangostack's main advantage. Revisit only with a concrete customer need.

- Shared multi-tenancy (bin-packing tenants onto shared hosts)
- A Kubernetes-only runtime
- Autoscaling and multi-AZ
- Cloud marketplaces (AWS, GCP, Azure)
- Compliance certifications

## Inbox

New ideas that are not sorted yet. Add a why and an effort, then move them into a tier.

- _(empty)_

## Done

- **Retry and timeout policies (item 1).** See the outcome in item 1.
- **Orphan reconciliation.**
  - A scheduled workflow (`reconcileOrphanedResources`, every 6 hours) enumerates the cloud accounts Pangostack has credentials for, through the optional `list` operation (`POST /resources/:type/list`). It records resources that no deployment accounts for.
  - It covers `vultr-vm` and `aws-vm`; other types answer `501` and are skipped.
  - A resource counts as an orphan only when its deployment is gone, or when it was dropped from the definition more than `GRACE_PERIOD_HOURS` ago. Only IDs with the Pangostack prefix are considered.
  - Credentials are resolved inside the activity, so they never reach Temporal history.
  - Findings are listed at `/admin/orphaned-resources`, where they can be ignored or marked deleted. Deletion itself stays manual.
- **Deployment transparency.** Per-resource steps and worker-reported sub-steps are persisted and shown in the portal ([concept](docs/deployment-transparency-concept.md)).

## Changelog

- **2026-10-06:** Item 1 done: retry policies for maintenance workflows, idempotent Chargebee charges, a per-deployment billed-period key, an `admins` notification topic and `BILLING_FAILED` notifications.
- **2026-10-06:** Roadmap rewritten after the [Omnistrate comparison](compare.md): sorted by value for effort, backups switched to native provider snapshots, restic moved to a later add-on.
