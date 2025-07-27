# OmniSaaS

> Deployment Tool for SaaS companies

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

### CLI

There is a CLI tool to manage the backend. Especially to import and export its configuration. The detailed description can be found in [the `cli` subdirectory](cli/) of this project.

## Tech Stack

### Backend

* NestJS
* Node
* Typescript

#### Frontend

* React
* React Form Hooks
* React Query
* Tailwind
* Zustand