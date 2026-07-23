# Frontend

The Pangostack customer portal and admin UI: a [Vite](https://vitejs.dev/) + React 18 app
(TypeScript, Tailwind 4 + daisyUI, React Query, Zustand, react-hook-form + yup).

For setup and running the whole stack, see the [root README](../README.md). To run just the frontend in
dev mode: `npm run dev` (served over HTTPS via `vite-plugin-mkcert`).

## Configuration

The backend URL is configured through `VITE_SERVER_URL` in a `.env` file (see `.env.production` for the
production build). All backend calls go through the generated client in `src/api/generated` — never
hand-write fetch calls.

## Common scripts

```bash
npm run dev          # dev server (vite)
npm run build        # type-check + production build (tsc && vite build)
npm run lint         # eslint, --max-warnings 0
npm run generate-api # regenerate the API client from the backend's OpenAPI (backend must be running)
```

## Structure

- `src/pages/` — routed pages (`admin/`, `teams/`, `login/`, `public/`), guarded by `RouteWhenAdmin`
  and `RouteWhenPrivate`.
- `src/components/` — shared components; prefer daisyUI components where possible.
- `src/api/generated/` — generated backend client (do not hand-edit).

See [CLAUDE.md](../CLAUDE.md) for the frontend conventions and the code-generation chain.
