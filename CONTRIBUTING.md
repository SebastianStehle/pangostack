# Contributing to Pangostack

Thanks for helping out! Contributions of every size are welcome: bug reports, docs fixes, new resource types or whole features.

## Before you start

- **Small fixes** (typos, docs, obvious bugs): just open a pull request.
- **Bigger changes** (new features, new resource types, schema changes): open an issue first and describe what you want to build. We agree on the approach before you invest the time.
- **Looking for something to do?** Check the [roadmap](Todo.md) and the issues labeled [`good first issue`](https://github.com/SebastianStehle/omnisaas/labels/good%20first%20issue).

## Set up your machine

You need Node.js 22, Docker and [mkcert](https://github.com/FiloSottile/mkcert).

```bash
mkcert -install                       # once: register the local certificate authority
cd backend && npm run mkcert:create   # once: local HTTPS certificates, then cd ..
cp backend/.env.example backend/.env  # fill in what you need
npm run install:all                   # root + backend + worker + frontend
npm run dev                           # Postgres, Temporal, backend, worker and frontend
```

Open the portal at http://localhost:5173. The [README](README.md#running-locally) explains the dev scripts in more detail, and [CLAUDE.md](CLAUDE.md) explains the architecture.

## Make your change

1. Fork the repository and create a branch: `git checkout -b fix/short-description`.
2. Follow the patterns that are already there. The most important ones:
   - Backend logic goes into `Command`/`Query` handlers in `backend/src/domain/<area>/use-cases/`. Controllers stay thin.
   - Temporal workflow code must not do I/O. Put side effects into activities.
   - New resource types live in `worker/src/resources/<type>/` and implement the `Resource` interface.
   - Never edit generated code (`*/generated/`). Regenerate it instead, see [CLAUDE.md](CLAUDE.md#code-generation-do-not-hand-edit-generated-folders).
   - Database changes need a migration: `npm run typeorm:generate-migrations <Name>` in `backend/`.
3. Add or update tests for the behavior you changed. Keep them few and focused.

## Check your work

Run these in every package you touched (`backend/`, `worker/`, `frontend/`):

```bash
npm run lint      # must pass with zero warnings; npm run lint:fix fixes most issues
npm run build
npm test          # backend and worker
```

For backend database changes, also run the integration tests. They need Docker:

```bash
cd backend && npm run test:int
```

A git hook runs `lint --fix` on staged files when you commit, so most formatting issues fix themselves.

## Open a pull request

- Keep it focused on one thing. Several small PRs are easier to review than one big one.
- Fill in the PR template: what changed, why, and how you tested it.
- Add screenshots for UI changes.
- CI runs lint, build, unit and integration tests. A PR is merged once CI is green and a maintainer approved it.

## Report a bug or request a feature

Use the [issue templates](https://github.com/SebastianStehle/omnisaas/issues/new/choose). For bugs, include the deployment definition (without secrets), what you expected and what happened.

Please do **not** report security issues in public issues. Contact the maintainer directly at sebastian@squidex.io.

## Code of conduct

Everyone taking part in this project follows our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
