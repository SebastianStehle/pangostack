# Writing a Deployment Definition

A deployment definition describes what your customers get when they click "Deploy": the form they fill out, the infrastructure that gets created, the price, and the charts they see afterwards. You write it in YAML and attach it to a service in the admin UI.

In this guide we build one from scratch: Squidex running with Docker Compose on a Vultr VM. The finished file is in [`configs/squidex-docker.yml`](../configs/squidex-docker.yml). Keep it open next to this guide.

## How values flow

Everything in a definition is connected with `${...}` expressions. There are three sources:

```yaml
${parameters.domain}   # what the customer typed into the form
${env.apiKey}          # values you set on the service in the admin UI (use for secrets!)
${context.vm.host}     # output of a resource that was deployed earlier
```

That's the whole trick. The customer fills out a form, the values flow into the resources, and each resource passes its outputs to the next one.

Expressions are JavaScript, so you can even calculate: `${parameters.nodes * 4}`.

## Step 1: Design the form

Start with `parameters`. Every entry becomes a field in the customer portal:

```yaml
parameters:
  - name: domain
    label: Public Domain
    type: string
    required: true
    display: true
    hint: Only add the domain name, not the full URL.

  - name: region
    label: Region
    type: string
    required: true
    defaultValue: fra
    display: true
    allowedValues:
      - value: fra
        label: Frankfurt
      - value: ams
        label: Amsterdam
```

Three habits that pay off:

- Always set a `label` and a `hint`, so the form explains itself.
- Set `display: true` on values the customer wants to see later in their deployment overview.
- Use `allowedValues` for anything provider-specific. Offer friendly choices here and translate them later (Step 2).

### Plans and upgrades

Don't expose provider plan names like `vc2-4c-8gb`. Offer your own tiers and control upgrades with `updateFrom`:

```yaml
  - name: plan
    label: Plan
    type: string
    required: true
    defaultValue: cores_4
    display: true
    allowedValues:
      - value: cores_4
        label: 4 Cores, 8 GB RAM, 160 GB SSD
        updateFrom: []
      - value: cores_8
        label: 8 Cores, 32 GB RAM, 640 GB SSD
        updateFrom: [cores_4]
```

Read it like this: a customer on `cores_4` may upgrade to `cores_8`. Nobody can downgrade, because `cores_4` has an empty `updateFrom`. If a value must never change at all (like a region — VMs can't move), set `immutable: true` on the parameter instead.

### Keep the form short

Move optional fields into sections. They are collapsed into their own group in the portal:

```yaml
  - name: googleClient
    label: Google Client ID
    type: string
    required: false
    section: Authentication

  - name: environment
    label: Environment
    type: string
    editor: textarea
    required: false
    section: More
    hint: Additional environment variables in the format key=value
```

Parameters can be `string`, `number`, or `boolean`. Numbers support `minValue`, `maxValue`, and `step`; strings support `minLength` and `maxLength`.

## Step 2: Create the first resource

Now the infrastructure. Resources are created **in the order you write them**, so start with the foundation:

```yaml
resources:
  - name: Virtual Machine
    id: vm
    type: vultr-vm
    parameters:
      apiKey: ${env.apiKey}
      region: ${parameters.region}
      app: docker
      backup: ${parameters.backup}
    mappings:
      plan:
        value: ${parameters.plan}
        map:
          cores_4: vc2-4c-8gb
          cores_8: vc2-8c-32gb
```

Two patterns here:

**Secrets come from `env`.** Set the Vultr API key once on the service in the admin UI and reference it as `${env.apiKey}`. It never appears in the definition, and customers never see it.

**`mappings` translate customer values into provider values.** The customer picked `cores_4`, Vultr needs `vc2-4c-8gb`. The mapping evaluates `value` and looks the result up in `map`.

Pick the `id` carefully. It's how everything else refers to this resource — and renaming it later means the resource is deleted and recreated.

## Step 3: Chain the next resource

The VM outputs `host`, `sshUser`, and `sshPassword`. The next resource picks them up via `context.vm.*`:

```yaml
  - name: Squidex
    id: squidex
    type: docker-compose-ssh
    parameters:
      dockerComposeUrl: https://raw.githubusercontent.com/Squidex/squidex-hosting/refs/heads/master/docker-compose/docker-compose.yml
      host: ${context.vm.host}
      sshUser: ${context.vm.sshUser}
      sshPassword: ${context.vm.sshPassword}
      SQUIDEX_DOMAIN: ${parameters.domain}
      SQUIDEX_GOOGLECLIENT: ${parameters.googleClient}
      environment: ${parameters.environment}
```

Note the convention: any parameter key that `docker-compose-ssh` doesn't know (like `SQUIDEX_DOMAIN`) is passed straight through as an environment variable to the compose file. Wiring a customer input into your app is a one-liner.

Optional inputs just work: if the customer left `googleClient` empty, the variable stays unset. No conditionals needed.

### The building blocks

- `vultr-vm` — creates a VM; outputs `host`, `sshUser`, `sshPassword`.
- `vultr-storage` — creates S3-compatible storage; outputs `s3HostName`, `s3AccessKey`, `s3SecretKey`.
- `docker-compose-ssh` — runs a compose file over SSH; the natural partner of `vultr-vm`.
- `helm` — deploys a Helm chart; unknown parameter keys become chart values (`a.b.c` turns into nested values).

A typical stack is VM + storage + compose: compute, assets, application — with the storage outputs passed into the compose environment exactly like the VM outputs above.

## Step 4: Add a health check

Attach a health check to the resource that serves the endpoint, so everyone can see the instance is actually up:

```yaml
    healthChecks:
      - name: Default
        url: https://${parameters.domain}/healthz
        type: http
```

Because the URL uses the customer's domain, a green check also proves their DNS is set up correctly.

## Step 5: Set the price

Pick a `pricingModel` (`fixed` or `pay_per_use`) and add price rules. Each rule reads: evaluate `target` — if it equals `test`, charge this item.

```yaml
pricingModel: fixed

prices:
  - billingIdentifier: machine
    label: Machine
    target: ${parameters.plan}
    test: cores_4
    pricePerHour: 0.12

  - billingIdentifier: machine
    label: Machine
    target: ${parameters.plan}
    test: cores_8
    pricePerHour: 0.24

  - billingIdentifier: backup
    label: Backup
    target: ${parameters.backup}
    test: 'true'
    pricePerHour: 0.02
```

So: one entry per plan tier, and boolean options are priced by testing against `'true'`. The `billingIdentifier` goes to the billing provider (Chargebee) — keep it stable.

For pay-per-use, also declare how usage is calculated. Each field must evaluate to an integer:

```yaml
usage:
  totalCores: ${parameters.nodes * parameters.coresPerNode}
  totalMemoryGB: ${parameters.nodes * 8}
```

## Step 6: Add metrics

Metrics turn into charts on the deployment page. Each resource type provides sources — `vultr-vm` has `cpu`, `memory`, `disk`; `docker-compose-ssh` has `containers`, `cpu`, `memory`; `helm` has `pods`, `restarts`, `cpu`, `memory`. A metric maps sources into one chart:

```yaml
metrics:
  - key: memory
    label: Memory
    unit: gb
    interval: 15m
    keep: 15d
    mapping:
      - resource: vultr-vm
        from: memory
        prefix: vm
      - resource: docker-compose-ssh
        from: memory
        prefix: docker
    chart: bar
    summaries:
      - label: Max Memory
        type: max
        prefix: vm
        value: used
```

`interval` says how often data is collected, `keep` how long it stays (durations like `30s`, `15m`, `1h`, `15d`). Mixing sources from several resources in one `mapping` — told apart by `prefix` — puts VM memory and container memory side by side. `summaries` add a headline number (`avg` or `max`) above the chart.

Start with the two or three metrics your customers actually care about. Adding more later is fine.

## Step 7: Tell the customer what to do next

Almost every deployment needs one manual step, usually DNS. Spell it out with `afterInstallationInstructions` (markdown, expressions allowed):

```yaml
afterInstallationInstructions: |-
  Create a new A record from your domain **${parameters.domain}** to the IP address of the virtual machine.

  Ensure that you do not enable https termination in Cloudflare.
```

Once the customer has done this, the health check from Step 4 turns green. A nice feedback loop.

## Step 8: Try it out

Attach the definition to a service version in the admin UI. It is validated on save, and errors point at the offending field. Then run a real deployment against a test account and walk the whole path: form looks right → resources come up → DNS set → health check green → metrics fill in.

Things that commonly bite:

- **Broken expressions fail silently** — they evaluate to an empty string. If a resource gets an empty value, check the expression first.
- **Order matters.** `${context.vm.host}` only works if the resource with `id: vm` comes *before* the one using it.
- **Renaming an `id` deletes and recreates the resource** on the next update.

Need the exact list of fields? The validation classes in `backend/src/domain/definitions/index.ts` are the source of truth.
