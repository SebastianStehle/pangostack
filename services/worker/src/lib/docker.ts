import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { NodeSSH } from 'node-ssh';
import { pollUntil } from './wait';

export async function deployDocker(ssh: NodeSSH, dockerComposeUrl: string, env: any, pollTimeout: number) {
  const remotePath = '/user';

  const tempDir = path.join(os.tmpdir(), randomUUID());
  await fs.mkdir(tempDir, { recursive: true });

  const composeFile = path.join(tempDir, 'docker-compose.yml');
  const composeContent = await (await fetch(dockerComposeUrl)).text();
  await fs.writeFile(composeFile, composeContent);

  await ssh.putFile(composeFile, `${remotePath}/docker-compose.yml`);

  const envFile = path.join(tempDir, '.env');
  const envContent = serializeEnvObject(env);
  await fs.writeFile(envFile, envContent);

  await ssh.putFile(envFile, `${remotePath}/.env`);

  try {
    const { stdout } = await ssh.execCommand(`docker compose -f ${remotePath}/docker-compose.yml --env-file ${remotePath}/.env up -d`, {
      cwd: remotePath,
    });

    pollUntil(pollTimeout, async () => {
      const status = await getContainers(ssh);

      return !status.find((x) => !x.isReady);
    });

    return stdout;
  } finally {
    ssh.dispose();
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

type Container = { name: string; isReady: boolean; details?: string };

export async function getContainers(ssh: NodeSSH): Promise<Container[]> {
  const result: Container[] = [];

  const { stdout } = await ssh.execCommand(`docker  ps --format json`);

  const lines = stdout.split('\n');
  for (const line of lines) {
    const json = JSON.parse(line);
    result.push({ name: json.Names, isReady: json.State === 'running', details: json.Status });
  }

  return result;
}

function serializeEnvObject(env: Record<string, string>) {
  return Object.entries(env)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('\n');
}
