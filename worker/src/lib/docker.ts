import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { NodeSSH } from 'node-ssh';
import { pollUntil } from './wait';

export async function composeDown(ssh: NodeSSH) {
  const remotePath = '/user';

  const { stdout } = await ssh.execCommand(`docker compose -f ${remotePath}/docker-compose.yml down`, {
    cwd: remotePath,
    onStdout: () => {},
    onStderr: () => {},
  });

  return stdout;
}

export async function composeUp(
  ssh: NodeSSH,
  dockerComposeUrl: string,
  env: any,
  pollTimeout: number,
  log?: (message: string) => void,
  onReadiness?: (ready: number, total: number, waitingFor: string[]) => void,
) {
  const remotePath = '/user';

  const tempDir = path.join(os.tmpdir(), randomUUID());
  await fs.mkdir(tempDir, { recursive: true });

  const composeFile = path.join(tempDir, 'docker-compose.yml');
  const composeContent = await downloadDocker(dockerComposeUrl);
  await fs.writeFile(composeFile, composeContent);
  await ssh.putFile(composeFile, `${remotePath}/docker-compose.yml`);
  log?.('Docker compose file uploaded');

  const envFile = path.join(tempDir, '.env');
  const envContent = serializeEnvObject(env);
  await fs.writeFile(envFile, envContent);
  await ssh.putFile(envFile, `${remotePath}/.env`);
  log?.('Docker env file uploaded');

  try {
    log?.('Docker compose up starting');
    const { stdout } = await ssh.execCommand(`docker compose -f ${remotePath}/docker-compose.yml --env-file ${remotePath}/.env up -d`, {
      cwd: remotePath,
      onStdout: () => {},
      onStderr: () => {},
    });

    log?.('Docker compose applied, waiting for status');
    await pollUntil(pollTimeout, async () => {
      const containers = await getContainers(ssh);
      const waitingFor = containers.filter((x) => !x.isReady);

      onReadiness?.(
        containers.length - waitingFor.length,
        containers.length,
        waitingFor.map((x) => x.name),
      );

      return containers.length > 0 && waitingFor.length === 0;
    });
    log?.('Docker compose ready');

    return stdout;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

type Container = { name: string; isReady: boolean; details?: string; originalName: string; image: string };

type DockerPsEntry = { Names: string; State: string; Status: string; Image: string };

export async function getContainers(ssh: NodeSSH): Promise<Container[]> {
  const result: Container[] = [];
  const { stdout } = await ssh.execCommand(`docker ps --format json`);

  const lines = stdout.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    let json: DockerPsEntry;
    try {
      json = JSON.parse(trimmed) as DockerPsEntry;
    } catch {
      continue;
    }

    let name = json.Names;
    if (name.indexOf('user-') === 0) {
      name = name.substring(5);
    }

    result.push({ name, originalName: json.Names, isReady: json.State === 'running', details: json.Status, image: json.Image });
  }

  return result;
}

export type ParsedImage = {
  // The full image reference, for example 'docker.io/squidex/squidex:7.23.0'.
  image: string;

  // The registry host, for example 'docker.io', when the reference includes one.
  registry?: string;

  // The repository without the registry and tag, for example 'squidex/squidex'.
  repository: string;

  // The tag, defaulting to 'latest' when the reference is untagged.
  tag: string;
};

// Matches '[REGISTRY[:PORT]/]REPOSITORY[:TAG]'. The registry is only taken when the first segment looks
// like a host (contains a dot or a port, or is localhost), so 'squidex/squidex' keeps its namespace as
// part of the repository. The tag group cannot contain a slash, so a registry port is not mistaken for
// one. This is not the full distribution/reference grammar (no digests), just the parts we need.
const IMAGE_PATTERN = /^(?:(?<registry>[^/]*[.:][^/]*|localhost)\/)?(?<repository>.+?)(?::(?<tag>[^/]+))?$/;

// Splits a docker image reference into its registry, repository and tag.
export function parseImage(image: string): ParsedImage {
  const { registry, repository, tag } = IMAGE_PATTERN.exec(image)?.groups ?? {};

  return {
    image,
    registry: registry || undefined,
    repository: repository ?? image,
    tag: tag || 'latest',
  };
}

type ContainerLog = { name: string; log: string };

export async function getLogs(ssh: NodeSSH): Promise<ContainerLog[]> {
  const result: ContainerLog[] = [];
  const containers = await getContainers(ssh);

  for (const container of containers) {
    const { stdout } = await ssh.execCommand(`docker logs ${container.originalName}`);

    result.push({ name: container.name, log: stdout });
  }

  return result;
}

function serializeEnvObject(env: Record<string, string>) {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    // A key or value containing a newline would inject additional, attacker controlled entries
    // into the .env file, so reject anything that is not a well formed single line variable.
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      throw new Error(`Invalid environment variable name: '${key}'.`);
    }

    const stringValue = String(value);
    if (/[\r\n]/.test(stringValue)) {
      throw new Error(`Environment variable '${key}' must not contain line breaks.`);
    }

    lines.push(`${key}=${stringValue}`);
  }

  return lines.join('\n');
}

async function downloadDocker(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download docker compose from '${url}, got ${response.status}`);
  }

  return await response.text();
}
