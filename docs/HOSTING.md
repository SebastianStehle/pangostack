# Deploying Pangostack

This guide gets Pangostack running on a server with Docker Compose. At the end you have a portal on your own domain with HTTPS, ready to create your first service.

For writing deployment definitions, see [DEFINITIONS.md](DEFINITIONS.md). For local development, see the main [README.md](../README.md).

## What you are deploying

One compose file ([`docker/pango/docker-compose.yml`](../docker/pango/docker-compose.yml)) starts everything:

- **pangostack** — the API and the customer portal, in one container.
- **pangostack_worker** — provisions the actual infrastructure (Vultr VMs, S3, Docker Compose over SSH, Helm).
- **postgresql** — the database.
- **temporal** — the workflow engine that drives deployments (plus its admin tools and UI).
- **pangostack_proxy** — a Caddy reverse proxy that gets HTTPS certificates automatically.

## Step 1: Prepare the server

You need a Linux server with Docker and a domain.

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Point an A record of your domain to the server's IP now — Caddy needs it to get a certificate:

```
your-domain.com → YOUR_SERVER_IP
```

Ports 80 and 443 must be open to the internet. Keep everything else firewalled.

## Step 2: Get the compose file

```bash
mkdir -p /opt/pangostack
cd /opt/pangostack
```

Copy `docker/pango/docker-compose.yml` and its `dynamicconfig/` folder from this repository into that directory.

## Step 3: Configure

Create a `.env` file next to the compose file:

```bash
# Your domain (used by the proxy and for login redirects)
PANGO_DOMAIN=your-domain.com

# Login providers (all optional — see below for password login)
PANGO_GITHUB_CLIENT=...
PANGO_GITHUB_SECRET=...
PANGO_GOOGLE_CLIENT=...
PANGO_GOOGLE_SECRET=...
PANGO_MICROSOFT_CLIENT=...
PANGO_MICROSOFT_SECRET=...

# Billing via Chargebee (optional)
PANGO_CHARGEBEE_SITE=...
PANGO_CHARGEBEE_APIKEY=...
```

Then open the compose file and change two defaults before going live: `SESSION_SECRET` and the Postgres password.

**No OAuth provider yet?** Enable password login and create an admin user by adding these to the `pangostack` environment in the compose file:

```yaml
AUTH_ENABLE_PASSWORD: 'true'
AUTH_INITIAL_USER_EMAIL: admin@your-domain.com
AUTH_INITIAL_USER_PASSWORD: choose-a-strong-password
```

## Step 4: Start it

```bash
docker compose up -d
docker compose ps          # everything should be "running"
docker compose logs -f     # watch the startup
```

Open `https://your-domain.com` and log in. Done — now create your first service in the admin UI and give it a [deployment definition](DEFINITIONS.md).

## Setting up login providers

Each provider needs a callback URL in this format:

```
https://your-domain.com/api/auth/login/<provider>/callback
```

- **GitHub**: Settings → Developer settings → OAuth Apps → New OAuth App. Use the callback URL with `github`.
- **Google**: Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID. Use the callback URL with `google`.
- **Microsoft**: Azure Portal → App registrations → New registration. Use the callback URL with `microsoft`.

Put the client ID and secret into your `.env` file and restart: `docker compose up -d`.

## Everyday operations

```bash
docker compose logs -f pangostack          # API + portal logs
docker compose logs -f pangostack_worker   # provisioning logs

# Update to the latest version
docker compose pull
docker compose down && docker compose up -d
```

If a deployment hangs or fails, the Temporal UI (port 8233, keep it internal) shows every running and failed workflow — that is the first place to look.

## Environment variable reference

The backend checks its configuration on startup and refuses to start if a required variable is missing or invalid — the error message names the variable. The `PANGO_*` variables above are just shorthands that the compose file maps to these:

### Core

| Variable | Description |
| --- | --- |
| `DB_URL` | Postgres URL, e.g. `postgres://postgres:secret@postgresql:5432/pango?sslmode=disable`. Required. |
| `SESSION_SECRET` | Signs the session cookies. Required in production. |
| `URLS_BASEURL` | Public base URL of the API, used for OAuth callbacks and confirmation links. |
| `URLS_BASEUIURL` | Public base URL of the portal, if different from the API. |
| `WORKER_ENDPOINT` | URL of the worker, registered on startup (default `http://localhost:3100`). |

### Login

| Variable | Description |
| --- | --- |
| `AUTH_GITHUB_CLIENTID` / `AUTH_GITHUB_CLIENTSECRET` | GitHub OAuth app. |
| `AUTH_GOOGLE_CLIENTID` / `AUTH_GOOGLE_CLIENTSECRET` | Google OAuth client. |
| `AUTH_MICROSOFT_CLIENTID` / `AUTH_MICROSOFT_CLIENTSECRET` | Microsoft app registration. |
| `AUTH_MICROSOFT_TENANT` | Optional Microsoft tenant. |
| `AUTH_OAUTH_CLIENTID` / `AUTH_OAUTH_CLIENTSECRET` | Any other OAuth2 provider. |
| `AUTH_OAUTH_AUTHORIZATION_URL` / `AUTH_OAUTH_TOKEN_URL` / `AUTH_OAUTH_USERINFO_URL` | Endpoints for that provider. |
| `AUTH_OAUTH_BRAND_NAME` / `AUTH_OAUTH_BRAND_COLOR` | Label and color of its login button. |
| `AUTH_ENABLE_PASSWORD` | `true` enables email/password login. |
| `AUTH_INITIAL_USER_EMAIL` / `AUTH_INITIAL_USER_PASSWORD` | Admin user created on first start. |
| `AUTH_INITIAL_USER_API_KEY` | Optional API key for that user. |

### Billing (Chargebee)

| Variable | Description |
| --- | --- |
| `BILLING_TYPE` | `chargebee` or `none` (default `none`). |
| `BILLING_CHARGEBEE_SITE` | Your Chargebee site name. |
| `BILLING_CHARGEBEE_APIKEY` | Your Chargebee API key. |
| `BILLING_CHARGEBEE_PLAN_ID` | Plan ID used for subscriptions. |
| `BILLING_CHARGEBEE_ADDON_<NAME>` | Maps a usage addon, e.g. `BILLING_CHARGEBEE_ADDON_CORES=cores`. |
| `BILLING_CHARGEBEE_TEAMPREFIX` | Optional prefix for customer names. |

### Workflows (Temporal)

| Variable | Description |
| --- | --- |
| `WORKFLOW_TEMPORAL_ADDRESS` | Temporal address, e.g. `temporal:7233`. |
| `WORKFLOW_TEMPORAL_APIKEY` | API key for Temporal Cloud. |
| `WORKFLOW_METRICS_MAX_AGE` | How long metrics are kept, e.g. `90d` (default). |
| `WORKFLOW_METRICS_MAX_COUNT` | Maximum stored metric values (default 10000). |

### Notifications (Notifo, optional)

| Variable | Description |
| --- | --- |
| `NOTIFO_API_KEY` | Notifo API key. |
| `NOTIFO_API_URL` | Notifo API URL (required when the key is set). |
