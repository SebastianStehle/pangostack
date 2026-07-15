import { Injectable, Logger } from '@nestjs/common';
import { NodeSSH } from 'node-ssh';
import { pollUntil } from 'src/lib';
import { VultrClient } from 'src/lib/vultr';
import { InstanceGet } from 'src/lib/vultr/generated';
import {
  defineResource,
  LogContext,
  ProgressReporter,
  Resource,
  ResourceApplyResult,
  ResourceMetricsResult,
  ResourceRequest,
  ResourceStatusResult,
} from '../interface';

type Parameters = { apiKey: string; region: string; plan: string; app: string; backup: boolean };

type Context = { host: string; sshUser: string; sshPassword: string };

type ResourceContext = { password: string };

@Injectable()
export class VultrVmResource implements Resource {
  private readonly logger = new Logger(VultrVmResource.name);

  descriptor = defineResource<Parameters, Context>({
    name: 'vultr-vm',
    description: 'Creates a Vultr virtual machine.',
    parameters: {
      apiKey: {
        description: 'The API Key.',
        type: 'string',
        required: true,
      },
      region: {
        description: 'The name of the region.',
        type: 'string',
        required: true,
      },
      plan: {
        description: 'The name of the plan.',
        type: 'string',
        required: true,
      },
      app: {
        description: 'The ID of the app from the marketplace.',
        type: 'string',
        required: true,
      },
      backup: {
        description: 'Indicates of automatic backups are enabled.',
        type: 'boolean',
        required: true,
      },
    },
    context: {
      host: {
        description: 'The Host name.',
        type: 'string',
        required: true,
      },
      sshUser: {
        description: 'The name of the SSH user.',
        type: 'string',
        required: true,
      },
      sshPassword: {
        description: 'The password of the SSH user.',
        type: 'string',
        required: true,
      },
    },
    metrics: {
      memory: {
        description: 'The memory usage of the virtual machine in GB.',
      },
      cpu: {
        description: 'The CPU usage of the virtual machine in percent.',
      },
      disk: {
        description: 'The root disk usage of the virtual machine in GB.',
      },
    },
  });

  async describe(): Promise<any> {
    const vultr = new VultrClient('NONE');

    const [{ plans }, { regions }] = await Promise.all([
      await (await fetch('https://api.vultr.com/v2/plans?type=vc2')).json(),
      vultr.regions.listRegions(),
    ]);

    return { plans, regions };
  }

  async apply(
    id: string,
    request: ResourceRequest<Parameters, ResourceContext>,
    progress: ProgressReporter,
    logContext: LogContext = {},
  ): Promise<ResourceApplyResult<Context>> {
    const { apiKey } = request.parameters;

    const vultr = new VultrClient(apiKey);

    let vm = await this.createInstance(vultr, id, request, progress, logContext);
    if (!request.resourceContext.password) {
      this.logger.error({
        message: 'Instance has no password. Previous attempt has failed. Deleting VM and trying again.',
        context: logContext,
      });
      progress.update('Previous attempt left an unusable instance, recreating it');
      await vultr.instances.deleteInstance(vm.id!);

      vm = await this.createInstance(vultr, id, request, progress, logContext);
    }

    if (isValidIp(vm)) {
      logContext.ip = vm.mainIp;
    }

    const ssh = new NodeSSH();
    this.logger.log({
      message: 'VM details are available, but the VM might not be running yet. Waiting for SSH connection',
      context: logContext,
    });
    progress.beginStep('Waiting for SSH connection');

    await pollUntil(request.timeoutMs, async () => {
      await ssh.connect({ host: vm.mainIp, username: 'root', password: request.resourceContext.password });
      return true;
    });

    return {
      resourceContext: request.resourceContext,
      context: {
        host: vm.mainIp!,
        sshUser: 'root',
        sshPassword: request.resourceContext.password,
      },
      connection: {
        ip: {
          value: vm.mainIp!,
          label: 'IP Address',
          isPublic: true,
        },
      },
    };
  }

  private async createInstance(
    vultr: VultrClient,
    label: string,
    request: ResourceRequest<Parameters, ResourceContext>,
    progress: ProgressReporter,
    logContext: LogContext,
  ) {
    const { backup, region, plan, app } = request.parameters;

    const backups = backup ? 'enabled' : 'disabled';

    progress.beginStep('Creating instance');

    let vm = await findInstance(vultr, label);
    if (vm) {
      if (plan !== vm.plan) {
        await vultr.instances.updateInstance(vm.id!, { plan });
      }

      this.logger.log({ message: 'Using existing instance, waiting for VM details to be ready', context: logContext });
      progress.beginStep('Waiting for instance to become ready');
      vm = await waitForInstance(vultr, vm, request.timeoutMs, true);
    } else {
      const response = await vultr.instances.createInstance({
        backups,
        imageId: app.toString(),
        label,
        plan,
        region,
      });

      vm = response.instance!;

      this.logger.log({ message: 'Using new instance, waiting for VM details to be ready', context: logContext });
      progress.beginStep('Waiting for instance to become ready');
      vm = await waitForInstance(vultr, vm, request.timeoutMs, false);

      request.resourceContext.password = vm.defaultPassword!;
    }

    return vm;
  }

  async delete(id: string, request: ResourceRequest<Parameters>) {
    const { apiKey } = request.parameters;

    const vultr = new VultrClient(apiKey);
    const vm = await findInstance(vultr, id);
    if (!vm) {
      return;
    }

    await vultr.instances.deleteInstance(vm.id!);
  }

  async status(id: string, request: ResourceRequest<Parameters, ResourceContext>): Promise<ResourceStatusResult> {
    const { apiKey } = request.parameters;

    const vultr = new VultrClient(apiKey);
    const vm = await findInstance(vultr, id);

    let failure: string | undefined = undefined;
    if (!vm) {
      failure = 'Instance not found';
    } else if (!isActiveStatus(vm)) {
      failure = `Instance does not have success status, got ${vm.serverStatus}`;
    } else if (!isValidIp(vm)) {
      failure = 'Instance does not have a IP address yet';
    }

    const status: ResourceStatusResult = {
      workloads: [
        {
          name: 'Default',
          nodes: [
            {
              name: 'Virtual Machine',
              isReady: !failure,
              message: failure,
            },
          ],
        },
      ],
    };

    return status;
  }

  async metrics(id: string, request: ResourceRequest<Parameters, ResourceContext>): Promise<ResourceMetricsResult> {
    const { apiKey } = request.parameters;

    const vultr = new VultrClient(apiKey);
    const vm = await findInstance(vultr, id);
    if (!vm || !isValidIp(vm)) {
      throw new Error(`Instance ${id} not found or has no IP address yet`);
    }

    const ssh = new NodeSSH();
    await ssh.connect({ host: vm.mainIp!, username: 'root', password: request.resourceContext.password });

    try {
      const [memInfo, cpuInfo, diskInfo] = await Promise.all([
        ssh.execCommand('cat /proc/meminfo'),
        ssh.execCommand(CPU_SAMPLE_COMMAND),
        ssh.execCommand('df -kP /'),
      ]);

      return {
        metrics: {
          memory: parseMemInfo(memInfo.stdout),
          cpu: parseCpuUsage(cpuInfo.stdout),
          disk: parseDiskInfo(diskInfo.stdout),
        },
      };
    } finally {
      ssh.dispose();
    }
  }
}

function kbToGb(kb: number) {
  return Math.round((kb / (1024 * 1024)) * 100) / 100;
}

function parseMemInfo(stdout: string): Record<string, number> {
  const values: Record<string, number> = {};
  for (const line of stdout.split('\n')) {
    const match = /^(\w+):\s+(\d+)/.exec(line);
    if (match) {
      values[match[1]] = parseInt(match[2], 10);
    }
  }

  const total = values['MemTotal'] || 0;

  // MemAvailable is a better estimate for actual usage than MemFree, because it includes reclaimable caches.
  const available = values['MemAvailable'] ?? values['MemFree'] ?? 0;

  return { used: kbToGb(total - available), total: kbToGb(total) };
}

// The CPU usage is calculated from the difference of two samples of the total and idle times.
const CPU_SAMPLE_COMMAND = 'head -1 /proc/stat; sleep 1; head -1 /proc/stat';

function parseCpuUsage(stdout: string): Record<string, number> {
  const samples = stdout
    .trim()
    .split('\n')
    .filter((x) => x.startsWith('cpu'))
    .map((line) => {
      const fields = line.trim().split(/\s+/).slice(1).map(Number);

      // The fourth and fifth fields are the idle and iowait times.
      const idle = (fields[3] || 0) + (fields[4] || 0);
      const total = fields.reduce((a, c) => a + (c || 0), 0);

      return { idle, total };
    });

  if (samples.length < 2) {
    return { usage: 0 };
  }

  const idleDelta = samples[1].idle - samples[0].idle;
  const totalDelta = samples[1].total - samples[0].total;
  if (totalDelta <= 0) {
    return { usage: 0 };
  }

  return { usage: Math.round((1 - idleDelta / totalDelta) * 10000) / 100 };
}

function parseDiskInfo(stdout: string): Record<string, number> {
  const lines = stdout.trim().split('\n');
  if (lines.length < 2) {
    return { used: 0, total: 0 };
  }

  const [, total, used] = lines[1].trim().split(/\s+/);

  return { used: kbToGb(parseInt(used, 10) || 0), total: kbToGb(parseInt(total, 10) || 0) };
}

async function waitForInstance(vultr: VultrClient, instance: any, timeout: number, hasPassword: boolean) {
  const instanceId = instance.id;

  await pollUntil(timeout, async () => {
    const { instance } = await vultr.instances.getInstance(instanceId);

    return !!instance && isActiveStatus(instance) && isValidIp(instance) && (hasPassword || !!instance.defaultPassword);
  });

  const { instance: newInstance } = await vultr.instances.getInstance(instanceId);
  return newInstance!;
}

function isActiveStatus(instance: InstanceGet) {
  return instance.serverStatus === 'ok' || instance.serverStatus === 'active';
}

function isValidIp(instance: InstanceGet) {
  return !!instance.mainIp && instance.mainIp !== '0.0.0.0';
}

async function findInstance(vultr: VultrClient, label: string) {
  let cursor: string | undefined = undefined;
  while (true) {
    const response = await vultr.instances.listInstances(undefined, cursor);

    if (response.instances) {
      for (const instance of response.instances) {
        if (instance.label === label) {
          return instance;
        }
      }
    }

    const newCursor = response.meta?.links?.next;
    if (!newCursor || newCursor === cursor) {
      break;
    }

    cursor = newCursor;
  }

  return null;
}
