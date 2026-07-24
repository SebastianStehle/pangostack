// ESLint 8 has no --no-warn-ignored, so passing an explicitly-ignored file (the ignorePatterns in
// .eslintrc.cjs plus ESLint's default-ignored dotfiles/dot-folders) emits a warning that fails
// --max-warnings 0. Drop those files before linting.
const IGNORED_PATHS = ['src/api/generated/', '/.storybook/', '/vite.config.ts', '/vitest.shims.d.ts'];

export default {
  '*.{ts,tsx}': (files) => {
    const linted = files.filter((file) => {
      const normalized = file.replace(/\\/g, '/');

      return !IGNORED_PATHS.some((ignored) => normalized.includes(ignored));
    });

    if (linted.length === 0) {
      return [];
    }

    const args = linted.map((file) => `"${file}"`).join(' ');

    return [`eslint --report-unused-disable-directives --max-warnings 0 --fix ${args}`];
  },
};
