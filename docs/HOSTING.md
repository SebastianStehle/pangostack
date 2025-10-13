# Pangostack Hosting Guide

This guide provides instructions for hosting Pangostack in production using Docker Compose.

## Overview

Pangostack runs as a single container that includes:

- **Backend API**: NestJS-based API server
- **Frontend**: React-based customer portal

## Dependencies

The complete setup requires these additional services:

- **Worker**: Background job processor with Kubernetes/Helm support (separate container)
- **PostgreSQL**: Database for data persistence
- **Temporal**: Workflow orchestration engine
- **Caddy Proxy**: Reverse proxy with automatic HTTPS

## Docker Compose Deployment

### 1. Prerequisites

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Download Production Configuration

```bash
# Create deployment directory
mkdir -p /opt/pangostack
cd /opt/pangostack

# Download the production docker-compose file
wget https://raw.githubusercontent.com/your-repo/pangostack/main/docker/pango/docker-compose.yml
```

### 3. Environment Configuration

Create a `.env` file with your configuration:

```bash
# Domain Configuration
PANGO_DOMAIN=your-domain.com

# Authentication Providers (Optional)
PANGO_GITHUB_CLIENT=your_github_client_id
PANGO_GITHUB_SECRET=your_github_client_secret
PANGO_GOOGLE_CLIENT=your_google_client_id
PANGO_GOOGLE_SECRET=your_google_client_secret
PANGO_MICROSOFT_CLIENT=your_microsoft_client_id
PANGO_MICROSOFT_SECRET=your_microsoft_client_secret

# Billing Configuration (Chargebee)
PANGO_CHARGEBEE_SITE=your_chargebee_site
PANGO_CHARGEBEE_APIKEY=your_chargebee_api_key
```

### 4. Deploy

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Configuration

### Environment Variables

#### Database Configuration

```bash
DB_URL=postgres://postgres:secret@postgresql:5432/pango?sslmode=disable
```

#### Authentication Configuration

```bash
AUTH_BASEURL=https://your-domain.com
SESSION_SECRET=your-super-secret-session-key

# OAuth Providers (all optional)
AUTH_GITHUB_CLIENTID=your_github_client_id
AUTH_GITHUB_CLIENTSECRET=your_github_client_secret
AUTH_GOOGLE_CLIENTID=your_google_client_id
AUTH_GOOGLE_CLIENTSECRET=your_google_client_secret
AUTH_MICROSOFT_CLIENTID=your_microsoft_client_id
AUTH_MICROSOFT_CLIENTSECRET=your_microsoft_client_secret

# Password Authentication
AUTH_ENABLE_PASSWORD=true
AUTH_INITIALUSER_EMAIL=admin@your-domain.com
AUTH_INITIALUSER_PASSWORD=secure-admin-password
```

#### Billing Configuration (Chargebee)

```bash
BILLING_TYPE=CHARGEBEE
BILLING_CHARGEBEE_SITE=your-site
BILLING_CHARGEBEE_APIKEY=your-api-key
BILLING_CHARGEBEE_PLAN_ID=pay_per_use
BILLING_CHARGEBEE_ADDON_ID_CORES=cores
BILLING_CHARGEBEE_ADDON_ID_MEMORY=memory
BILLING_CHARGEBEE_ADDON_ID_STORAGE=storage
BILLING_CHARGEBEE_ADDON_ID_VOLUME=volume
```

### Network Configuration

The default setup exposes these ports:

- **80**: HTTP (redirects to HTTPS)
- **443**: HTTPS (main application)
- **3000**: Worker API (internal)
- **4000**: Backend API (internal)
- **5433**: PostgreSQL (internal)
- **7233**: Temporal (internal)

### SSL/TLS Configuration

The included Caddy proxy automatically handles SSL certificates via Let's Encrypt. Ensure:

1. Your domain points to the server's IP address
2. Ports 80 and 443 are accessible from the internet
3. The `PANGO_DOMAIN` environment variable is set correctly

## Post-Deployment Setup

### 1. DNS Configuration

Create an A record pointing your domain to your server's IP address:

```
your-domain.com → YOUR_SERVER_IP
```

### 2. Authentication Providers Setup

#### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - Homepage URL: `https://your-domain.com`
   - Authorization callback URL: `https://your-domain.com/auth/github/callback`
3. Add the Client ID and Secret to your environment variables

#### Google OAuth

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID with:
   - Authorized redirect URIs: `https://your-domain.com/auth/google/callback`
3. Add the Client ID and Secret to your environment variables

#### Microsoft OAuth

1. Go to Azure Portal → App registrations
2. Create a new registration with:
   - Redirect URI: `https://your-domain.com/auth/microsoft/callback`
3. Add the Client ID and Secret to your environment variables

## Monitoring and Maintenance

### Health Checks

Pangostack includes built-in health checks:

- Main application: `https://your-domain.com/health`
- API documentation: `https://your-domain.com/api`

### Logs

View application logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f pangostack
docker-compose logs -f pangostack_worker
docker-compose logs -f postgresql
```

### Updates

To update Pangostack:

```bash
# Pull latest images
docker-compose pull

# Restart services
docker-compose down
docker-compose up -d
```

---

This hosting guide should get you up and running with Pangostack in production. For development setup, see the main [README.md](../README.md).
