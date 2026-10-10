// The suites only read environment variables, so the same tests run against compose, a dev stack or staging.
export const config = {
  serverUrl: process.env.E2E_SERVER_URL || 'https://localhost:8443',
  apiKey: process.env.E2E_API_KEY || 'e2e-api-key',
  adminEmail: process.env.E2E_ADMIN_EMAIL || 'admin@pango.test',
  adminPassword: process.env.E2E_ADMIN_PASSWORD || 'e2e-Secret1',
  deploymentTimeoutMs: +(process.env.E2E_TIMEOUT_DEPLOYMENT || 120_000),
  composeProject: process.env.E2E_COMPOSE_PROJECT || 'pangostack-e2e',
};
