import { defineConfig, devices } from '@playwright/test';
import { config } from 'src/shared/config';
import { ADMIN_STATE } from './auth-state';

// The fixtures call the API from Node, which must accept the self-signed certificate of the e2e proxy.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const TEST_TIMEOUT_MS = 120_000;
const EXPECT_TIMEOUT_MS = 10_000;

export default defineConfig({
  testDir: '.',
  outputDir: '../test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: TEST_TIMEOUT_MS,
  expect: { timeout: EXPECT_TIMEOUT_MS },
  reporter: [[process.env.CI ? 'github' : 'list'], ['html', { outputFolder: '../playwright-report', open: 'never' }]],
  use: {
    baseURL: config.serverUrl,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: ADMIN_STATE },
      dependencies: ['setup'],
    },
  ],
});
