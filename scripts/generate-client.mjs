// Generates a typescript-fetch client from an OpenAPI spec with the official generator image, so that no Java is needed.
// Usage: node ../scripts/generate-client.mjs <spec> <output> [generator args], run from the package that consumes the API.
import { execFileSync } from 'child_process';
import { readFileSync, rmSync } from 'fs';
import { dirname, join, relative, resolve, sep } from 'path';
import { fileURLToPath } from 'url';

const [spec, output, ...args] = process.argv.slice(2);
if (!spec || !output) {
  throw new Error('Usage: node generate-client.mjs <spec> <output> [generator args]');
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Current working directory.
const packageDir = process.cwd();

// Each package pins its generator version, because newer versions produce different code.
const { 'generator-cli': generator } = JSON.parse(readFileSync(join(packageDir, 'openapitools.json'), 'utf8'));

rmSync(resolve(packageDir, output), { recursive: true, force: true });

// Specs of other packages are referenced with relative paths, so the whole repository is mounted.
const workingDir = ['/local', ...relative(repositoryRoot, packageDir).split(sep)].join('/');

const dockerArgs = ['run', '--rm', '-v', `${repositoryRoot}:/local`, '-w', workingDir];

// Otherwise the generated files are owned by root on Linux.
if (process.getuid && process.getgid) {
  dockerArgs.push('--user', `${process.getuid()}:${process.getgid()}`);
}

execFileSync(
  'docker',
  [
    ...dockerArgs,
    `openapitools/openapi-generator-cli:v${generator.version}`,
    'generate',
    '-g',
    'typescript-fetch',
    '--additional-properties=useSingleRequestParameter=false,ensureUniqueParams=false',
    '-i',
    spec,
    '-o',
    output,
    ...args,
  ],
  { stdio: 'inherit' },
);

execFileSync('node', [join(repositoryRoot, 'scripts', 'add-ts-ignore.js'), output], { stdio: 'inherit' });
