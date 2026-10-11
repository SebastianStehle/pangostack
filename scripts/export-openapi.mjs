// Downloads the OpenAPI spec of a running server and stores it as YAML, so that API changes are reviewable in diffs.
// Usage: node ../scripts/export-openapi.mjs <url> <file>, run from the package that owns the API.
import { writeFileSync } from 'fs';
import { createRequire } from 'module';
import { join } from 'path';

const [url, file] = process.argv.slice(2);
if (!url || !file) {
  throw new Error('Usage: node export-openapi.mjs <url> <file>');
}

// The yaml package is a dependency of the calling package, not of the repository root.
const { stringify } = createRequire(join(process.cwd(), 'package.json'))('yaml');

// The dev servers use self-signed certificates.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const response = await fetch(url);
if (!response.ok) {
  throw new Error(`Failed to download the OpenAPI spec from ${url}, got ${response.status}.`);
}

writeFileSync(file, stringify(await response.json()));
console.log(`Exported ${url} to ${file}.`);
