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

export async function composeUp(ssh: NodeSSH, dockerComposeUrl: string, env: any, pollTimeout: number, log?: (message: string) => void) {
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
      const status = await getContainers(ssh);

      return !status.find((x) => !x.isReady);
    });
    log?.('Docker compose ready');

    return stdout;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

type Container = { name: string; isReady: boolean; details?: string; originalName: string };

export async function getContainers(ssh: NodeSSH): Promise<Container[]> {
  const result: Container[] = [];
  const { stdout } = await ssh.execCommand(`docker ps --format json`);

  const lines = stdout.split('\n');
  for (const line of lines) {
    const json = JSON.parse(line);

    let name = json.Names as string;
    if (name.indexOf('user-') === 0) {
      name = name.substring(5);
    }

    result.push({ name, originalName: json.Names, isReady: json.State === 'running', details: json.Status });
  }

  return result;
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
  return Object.entries(env)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('\n');
}

async function downloadDocker(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download docker compose from '${url}, got ${response.status}`);
  }

  return await response.text();
}
