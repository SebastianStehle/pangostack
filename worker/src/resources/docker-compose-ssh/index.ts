import { Injectable, Logger } from '@nestjs/common';
import { NodeSSH } from 'node-ssh';
import {
  composeDown,
  composeUp,
  formatReadiness,
  getContainers,
  getLogs,
  parseEnvironment,
  parseImage,
  parsePercent,
  parseSizeGb,
  pollUntil,
  resolveComposeProject,
  roundValue,
} from 'src/lib';
import {
  defineResource,
  LabeledValue,
  Resource,
  ResourceLogResult,
  ResourceMetricsResult,
  ResourceReporter,
  ResourceRequest,
  ResourceStatusResult,
} from '../interface';

type Parameters = {
  host: string;
  sshUser: string;
  sshPassword: string;
  dockerComposeUrl: string;
  environment?: string;
  mainImages?: string;
};

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
      mainImages: {
        description: "A comma separated list of image repositories to report the version for, for example 'squidex/squidex,mongo'.",
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

  async apply(id: string, request: ResourceRequest<Parameters>, reporter: ResourceReporter): Promise<void> {
    const { dockerComposeUrl, host, environment, sshUser, sshPassword, ...others } = request.parameters;

    // mainImages is metadata used by status(), not an environment variable for the containers.
    delete others.mainImages;

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

      const project = await resolveComposeProject(ssh, id);
      await composeUp(
        ssh,
        project,
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
    const ssh = new NodeSSH();
    try {
      await ssh.connect({ host, username: sshUser, password: sshPassword });

      await composeDown(ssh, await resolveComposeProject(ssh, id));
    } catch {
      this.logger.warn(`Failed to delete resource ${id}. Host has probably been deleted already`);
    } finally {
      ssh.dispose();
    }
  }

  async log(id: string, request: ResourceRequest<Parameters>): Promise<ResourceLogResult> {
    const { host, sshUser, sshPassword } = request.parameters;

    const ssh = new NodeSSH();
    try {
      await ssh.connect({ host, username: sshUser, password: sshPassword });
      const logs = await getLogs(ssh, await resolveComposeProject(ssh, id));

      return { instances: logs.map(({ name, log }) => ({ instanceId: name, messages: log })) };
    } finally {
      ssh.dispose();
    }
  }

  async metrics(id: string, request: ResourceRequest<Parameters>): Promise<ResourceMetricsResult> {
    const { host, sshUser, sshPassword } = request.parameters;

    const ssh = new NodeSSH();
    try {
      await ssh.connect({ host, username: sshUser, password: sshPassword });

      const containers = await getContainers(ssh, await resolveComposeProject(ssh, id));
      if (containers.length === 0) {
        return { metrics: { containers: { running: 0, total: 0 }, cpu: {}, memory: {} } };
      }

      // Without explicit names docker stats reports every container on the host, including other deployments.
      const names = containers.map(({ originalName }) => originalName).join(' ');
      const stats = await ssh.execCommand(`docker stats --no-stream --format "{{json .}}" ${names}`);

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

  async status(id: string, request: ResourceRequest<Parameters>): Promise<ResourceStatusResult> {
    const { host, sshUser, sshPassword, mainImages } = request.parameters;

    const ssh = new NodeSSH();
    try {
      await ssh.connect({ host, username: sshUser, password: sshPassword });
      const containers = await getContainers(ssh, await resolveComposeProject(ssh, id));

      const status: ResourceStatusResult = {
        workloads: [
          {
            name: 'Docker Compose',
            nodes: containers,
          },
        ],
        properties: resolveProperties(containers, mainImages),
      };

      return status;
    } finally {
      ssh.dispose();
    }
  }
}

export function resolveProperties(
  containers: { image: string; details?: string }[],
  mainImages: string | undefined,
): Record<string, LabeledValue> {
  if (!mainImages) {
    return {};
  }

  // The last path segment of a repository, capitalized.
  //  - for example 'squidex/squidex' -> 'Squidex'.
  const displayName = (repository: string) => {
    const segment = repository.substring(repository.lastIndexOf('/') + 1);

    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const repositories = mainImages.split(',').map((x) => x.trim());

  const result: Record<string, LabeledValue> = {};
  for (const repository of repositories) {
    const match = containers
      .map((container) => ({ container, parsed: parseImage(container.image) }))
      .find(({ parsed }) => parsed.repository === repository || parsed.repository.endsWith(`/${repository}`));

    if (!match) {
      continue;
    }

    const name = displayName(repository);
    result[`${repository}/version`] = { value: match.parsed.tag, label: `${name} Version`, isPublic: true };

    if (match.container.details) {
      result[`${repository}/status`] = { value: match.container.details, label: `${name} Status`, isPublic: true };
    }
  }

  return result;
}
