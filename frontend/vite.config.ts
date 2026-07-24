/// <reference types="vitest/config" />
import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import tailwindcss from '@tailwindcss/vite';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { configDefaults } from 'vitest/config';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const dirName = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 3000,
    sourcemap: true
  },
  resolve: {
    alias: {
      'src': path.resolve(dirName, './src')
    }
  },
  plugins: [mkcert(), react(), tailwindcss()],
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        // react-ace (CodeEditor / LogViewer) and @yaireo/tagify (pulled in via the src/components
        // barrel by DeploymentResource / DeploymentInstructions) cannot be loaded by the
        // addon-vitest browser bundler. These stories render correctly in the Storybook UI and are
        // covered by `build-storybook`, so they are excluded from the browser test run.
        exclude: [
          ...configDefaults.exclude,
          '**/CodeEditor.stories.tsx',
          '**/LogViewer.stories.tsx',
          '**/DeploymentResource.stories.tsx',
          '**/DeploymentInstructions.stories.tsx',
        ],
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});