import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const DEPLOYMENT_TEST_TIMEOUT_MS = 180_000;

export default defineConfig({
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['api/**/*.e2e.ts'],
    testTimeout: DEPLOYMENT_TEST_TIMEOUT_MS,
    hookTimeout: DEPLOYMENT_TEST_TIMEOUT_MS,
    env: {
      // The e2e proxy uses a self-signed certificate.
      NODE_TLS_REJECT_UNAUTHORIZED: '0',
    },
  },
});
