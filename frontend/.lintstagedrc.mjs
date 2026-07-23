// ESLint 8 has no --no-warn-ignored, so passing an explicitly-ignored file (see ignorePatterns
// in .eslintrc.cjs) emits a warning that fails --max-warnings 0. Drop those files instead.
const IGNORED_PATH = 'src/api/generated/';

export default {
  '*.{ts,tsx}': (files) => {
    const linted = files.filter((file) => !file.replace(/\\/g, '/').includes(IGNORED_PATH));

    if (linted.length === 0) {
      return [];
    }

    const args = linted.map((file) => `"${file}"`).join(' ');

    return [`eslint --report-unused-disable-directives --max-warnings 0 --fix ${args}`];
  },
};
