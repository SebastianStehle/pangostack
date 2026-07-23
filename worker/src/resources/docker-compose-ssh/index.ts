import { Injectable, Logger } from '@nestjs/common';
import { NodeSSH } from 'node-ssh';
import { composeDown, composeUp, formatReadiness, getContainers, getLogs, parseEnvironment, pollUntil } from 'src/lib';
import {
  defineResource,
  Resource,
  ResourceLogResult,
  ResourceMetricsResult,
  ResourceReporter,
  ResourceRequest,
  ResourceStatusResult,
} from '../interface';

type Parameters = { host: string; sshUser: string; sshPassword: string; dockerComposeUrl: string; environment?: string };

@Injectable()
export class DockerComposeSshResource implements Resource {
  private readonly logger = new Logger(DockerComposeSshResource.name);

  descriptor = defineResource<Parameters, any>({
    name: 'docker-compose-ssh',
    description: 'Applies a docker compose file over SSH.',
    parameters: {
      host: {
        description: 'The host name of IP address of the target server.',
        type: 'string',
        required: true,
      },
      sshUser: {
        description: 'The SSH username.',
        type: 'string',
        required: true,
      },
      sshPassword: {
        description: 'The SSH password.',
        type: 'string',
        required: true,
      },
      dockerComposeUrl: {
        description: 'The URL of the docker compose file.',
        type: 'string',
        required: true,
      },
      environment: {
        description: 'The additional environment variables.',
        type: 'string',
      },
    },
    context: {},
    metrics: {
      containers: {
        description: 'The number of running containers.',
      },
      cpu: {
        description: 'The CPU usage per container in percent.',
      },
      memory: {
        description: 'The memory usage per container in GB.',
      },
    },
  });

  async describe(): Promise<any> {
    return {};
  }

  async apply(_: string, request: ResourceRequest<Parameters>, reporter: ResourceReporter): Promise<void> {
    const { dockerComposeUrl, host, environment, sshUser, sshPassword, ...others } = request.parameters;

    const ssh = new NodeSSH();
    try {
      reporter.beginStep('Waiting for SSH connection');

      await pollUntil(request.timeoutMs, async () => {
        await ssh.connect({ host, username: sshUser, password: sshPassword });
        return true;
      });

      // Custom defined variables do not override direct paramters (aka others).
      const env = parseEnvironment(environment);
      for (const [key, value] of Object.entries(others)) {
        if (value) {
          env[key] = value;
        }
      }

      reporter.beginStep('Starting containers');

      await composeUp(
        ssh,
        dockerComposeUrl,
        env,
        request.timeoutMs,
        (message) => reporter.report(message, { log: true }),
        (ready, total, waitingFor) => reporter.report(formatReadiness(ready, total, 'containers', waitingFor)),
      );
    } finally {
      ssh.dispose();
    }
  }

  async delete(id: string, request: ResourceRequest<Parameters>) {
    const { host, sshUser, sshPassword } = request.parameters;
    try {
      const ssh = new NodeSSH();
      await ssh.connect({ host, username: sshUser, password: sshPassword });

      await composeDown(ssh);
    } catch {
      this.logger.warn(`Failed to delete resource ${id}. Host has probably been deleted already`);
    }
  }

  async log(_id: string, request: ResourceRequest<Parameters>): Promise<ResourceLogResult> {
    const { host, sshUser, sshPassword } = request.parameters;

    const ssh = new NodeSSH();
    try {
      await ssh.connect({ host, username: sshUser, password: sshPassword });
      const logs = await getLogs(ssh);

      return { instances: logs.map(({ name, log }) => ({ instanceId: name, messages: log })) };
    } finally {
      ssh.dispose();
    }
  }

  async metrics(_id: string, request: ResourceRequest<Parameters>): Promise<ResourceMetricsResult> {
    const { host, sshUser, sshPassword } = request.parameters;

    const ssh = new NodeSSH();
    try {
      await ssh.connect({ host, username: sshUser, password: sshPassword });

      const [containers, stats] = await Promise.all([
        getContainers(ssh),
        ssh.execCommand('docker stats --no-stream --format "{{json .}}"'),
      ]);

      const cpu: Record<string, number> = {};
      const memory: Record<string, number> = {};
      for (const line of stats.stdout.split('\n').filter((x) => x.trim().startsWith('{'))) {
        const containerStats = JSON.parse(line) as { Name?: string; CPUPerc?: string; MemUsage?: string };

        const name = containerStats.Name;
        if (!name) {
          continue;
        }

        cpu[name] = roundValue(parsePercent(containerStats.CPUPerc));
        memory[name] = roundValue(parseSizeGb(containerStats.MemUsage?.split('/')[0]));
      }

      return {
        metrics: {
          containers: { running: containers.filter(({ isReady }) => isReady).length, total: containers.length },
          cpu,
          memory,
        },
      };
    } finally {
      ssh.dispose();
    }
  }

  async status(_id: string, request: ResourceRequest<Parameters>): Promise<ResourceStatusResult> {
    const { host, sshUser, sshPassword } = request.parameters;

    const ssh = new NodeSSH();
    try {
      await ssh.connect({ host, username: sshUser, password: sshPassword });
      const containers = await getContainers(ssh);

      const status: ResourceStatusResult = {
        workloads: [
          {
            name: 'Docker Compose',
            nodes: containers,
          },
        ],
      };

      return status;
    } finally {
      ssh.dispose();
    }
  }
}

const SIZE_UNITS_GB: Record<string, number> = {
  b: 1 / 1024 ** 3,
  kb: 1 / 1000 ** 2,
  kib: 1 / 1024 ** 2,
  mb: 1 / 1000,
  mib: 1 / 1024,
  gb: 1,
  gib: 1,
  tb: 1000,
  tib: 1024,
};

function parsePercent(source: string | undefined): number {
  const parsed = parseFloat(source?.replace('%', '') || '');

  return isNaN(parsed) ? 0 : parsed;
}

function parseSizeGb(source: string | undefined): number {
  const match = /^([\d.]+)\s*([a-z]+)$/i.exec(source?.trim() || '');
  if (!match) {
    return 0;
  }

  return parseFloat(match[1]) * (SIZE_UNITS_GB[match[2].toLowerCase()] ?? 0);
}

function roundValue(value: number): number {
  return Math.round(value * 100) / 100;
}
