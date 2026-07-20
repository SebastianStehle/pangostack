import * as path from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // SWC keeps decorator metadata (emitDecoratorMetadata) intact, which NestJS DI, TypeORM and
  // class-validator rely on at runtime. Vitest's default oxc transform would strip it, so it is
  // disabled and SWC owns the TypeScript transform.
  oxc: false,
  plugins: [swc.vite()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
