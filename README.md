# Pangostack

> **Pangostack** is a modular deployment platform tailored for SaaS providers.
> 
> It simplifies infrastructure provisioning by offering:
> 
> - A **backend API** to define deployment blueprints and manage versions.
> - Integration with external **billing providers** (e.g., Stripe).
> - A **customer-facing portal** to let users self-deploy their SaaS instance on demand.

### Features

* Various pricing models
  * Fixed prices
  * Pay per usage
  * Pay per month, depending on selection
* Billing providers
  * Chargebee
* Resources
  * Vultr VM (provides SSH connection)
  * Vultr S3 Storage
  * Docker Compose (based on SSH connection)
  * Helm

Whether you're offering a monolithic app or a collection of microservices, Pangostack helps you deploy reproducible, scalable environments — all while keeping your cost-to-profit ratio in check.


![alt text](docs/screenshot-portal.png)

## Architecture and Concept

![Architecture](docs/architecture.jpg)

The architecture is super simple so that it will be easy to deploy it.

- **Backend**: Manages all deployments and orchestrates workflows via [Temporal](https://temporal.io/).
- **Workers**: Microservices that create or update resources based on deployment definitions.
- **Frontend**: Customer-facing portal for self-service provisioning.

### Deployment definitions

Deployment definitions are written in JSON or YAML and specify the parameters and resources for a SaaS instance.

```yaml
---
parameters:
- name: domain
  label: Public Domain
  type: string
  required: true
  display: true
- name: plan
  label: Plan
  type: string
  required: true
  display: true
  allowedValues:
  - value: cores_4
    label: 4 Cores, 8 GB RAM, 160 GB SSD
  - value: cores_8
    label: 8 Cores, 32 GB RAM, 640 GB SSD
  - value: cores_16
    label: 16 Cores, 64 GB RAM, 1280 GB SSD
afterInstallationInstructions: 'Create a new A record from your domain '
pricingModel: fixed
resources:
- name: Virtual Machine
  id: vm
  type: vultr-vm
  parameters:
    apiKey: "${env.apiKey}"
  mappings:
    plan:
      value: "${parameters.plan}"
      map:
        cores_4: vc2-4c-8gb
        cores_8: vc2-8c-32gb
        cores_16: vc2-16c-64gb
- name: Squidex
  id: squidex
  type: docker-compose-ssh
  parameters:
    dockerComposeUrl: https://raw.githubusercontent.com/Squidex/squidex-hosting/refs/heads/master/docker-compose/docker-compose.yml
  healthChecks:
  - name: Default
    url: https://${parameters.domain}/healthz
    type: http
prices:
- target: "${parameters.plan}"
  test: cores_4
  amount: 80
usage:
  totalCores: "${parameters.mongoDbNodes * parameters.mongoDbCoresPerNode + (parameters.squidexNodes
    + 1) * parameters.squidexCoresPerNode}"

```

## 🛠 Resource Provisioning Philosophy

Pangostack does **not** reinvent infrastructure-as-code. Instead, it builds on top of existing tools:

- **Docker Compose**: For local or single-node deployments
- **Kubernetes + Helm**: For scalable cloud-native services
- **Terraform**: For declarative infrastructure (where supported)

This approach ensures:
- Lower learning curve
- Portability between local and production environments
- Modular extension with existing CI/CD tooling

### Is the definition schema complete?

No, the schema is evolving. Key future additions include:

- Health checks per resource
- Parameter mapping
- Parameter validation constraints (beyond simple min/max)

### Why multiple resource types?

Some providers or tools only support specific infrastructure:

- Helm is powerful but may lack support for external resources like storage (S3) and domains.
- Terraform excels in some areas but is not universal

Pangostack mixes and matches tools to provide the best coverage.

### Which cloud providers are supported?

While theoretically cloud-agnostic, Pangostack is optimized for affordable, global hosting providers like:

* [DigitalOcean](https://digitalocean.com)
* [Vultr](https://vultr.com)

These allow you to offer services at a profit margin (~60%) with predictable pricing.

### What will it cost for my customers?

It depends on your configuration. For example:

- A simple Docker Compose setup could run on a $20/month VPS.
- You could resell such a service for ~$50/month, depending on features and support.

Use your deployment definitions to estimate and communicate costs transparently.

### Why are you building this?

I want to provide better hosting options to my customers for my existing applications:

* https://github.com/squidex/squidex
* https://github.com/notifo-io/notifo

## How to start

The main project has two parts, the backend and frontent. You have to run them individually:

### Backend

```
cd backend
npm i
npm run start
  - or -
npm run start:debug for debugging with chrome
```

#### Certificates (ONE TIME)

Before you can start running the backend you have to create local dev certificates. We need https for the authentication flow, because a cookie is set before a redirecting to an exernal authentication provider and this cookie is only available when you run the site with https. At the moment we use [mkcert](https://github.com/FiloSottile/mkcert) for that.

Follow the installation instructions from the repository: https://github.com/FiloSottile/mkcert

First you have to register the certificate authority in your system.

```
mkcert -install
```

Then create the local dev certificates!

If you are in the root folder:

```
mkcert -cert-file backend/dev/local-dev.pem -key-file backend/dev/local-dev-key.pem localhost
```

Or if you are in the backend folder

```
mkcert -cert-file dev/local-dev.pem -key-file dev/local-dev-key.pem localhost
```

#### Configuration

At the moment we use a free cloud server for that. Just ask one of the team members for credentials and put the `.env` file to the backend folder.
Before we can start the backend, we need a running postgres database. See `dev/postgress/docker-compose`

### Frontend

```
cd frontend
npm i
npm run dev
```

## Contributing

We welcome contributions from developers of all skill levels.

### How to contribute:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/xyz`)
3. Commit your changes clearly
4. Push to your fork and open a Pull Request

Before submitting:
- Make sure all code is formatted and linted
- Include tests where possible
- Describe what the change does and why it matters

If you are planning to work on a bigger features, let schedule a call first to discuss the details.

## Tech Stack

### Backend

* NestJS
* Node
* Typescript
* Go (planned for the CLI)

#### Frontend

* React
* React Form Hooks
* React Query
* Tailwind
* Zustand
