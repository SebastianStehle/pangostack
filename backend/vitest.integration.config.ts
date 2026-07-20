import * as path from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

const TIMEOUT_MS = 60_000;

export default defineConfig({
  // See vitest.config.ts: SWC keeps the decorator metadata that NestJS and TypeORM need at runtime.
  oxc: false,
  plugins: [swc.vite()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
      test: path.resolve(__dirname, 'test'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.int-spec.ts'],
    globalSetup: ['./test/integration/setup/global-setup.ts'],
    setupFiles: ['./vitest.setup.ts'],
    // One container is started once in the global setup and shared by every test file. Files can run
    // in parallel because each gets its own database cloned from the migrated template (see harness),
    // so there is no shared mutable state to serialize on.
    hookTimeout: TIMEOUT_MS,
    testTimeout: TIMEOUT_MS,
  },
});
