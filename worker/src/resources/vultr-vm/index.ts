import { Injectable } from '@nestjs/common';
import { NodeSSH } from 'node-ssh';
import { collectVmMetrics, pollUntil } from 'src/lib';
import { VultrClient } from 'src/lib/vultr';
import { InstanceGet } from 'src/lib/vultr/generated';
import { defineResource, Resource, ResourceMetricsResult, ResourceReporter, ResourceRequest, ResourceStatusResult } from '../interface';

type Parameters = { apiKey: string; region: string; plan: string; app: string; backup: boolean };

type Context = { host: string; sshUser: string; sshPassword: string };

type ResourceContext = { password: string };

@Injectable()
export class VultrVmResource implements Resource {
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

  async apply(id: string, request: ResourceRequest<Parameters, ResourceContext>, reporter: ResourceReporter): Promise<void> {
    const { apiKey } = request.parameters;

    const vultr = new VultrClient(apiKey);

    let vm = await this.createInstance(vultr, id, request, reporter);
    if (!request.resourceContext.password) {
      reporter.report('Previous attempt left an unusable instance, recreating it', { log: true });
      await vultr.instances.deleteInstance(vm.id!);

      vm = await this.createInstance(vultr, id, request, reporter);
    }

    // Persist the resource context (which now holds the generated password) before waiting for SSH.
    // If the SSH wait fails, the retry can reuse this instance instead of orphaning it.
    reporter.appendResourceContext(request.resourceContext);

    const ssh = new NodeSSH();
    reporter.beginStep('Waiting for SSH connection');

    await pollUntil(request.timeoutMs, async () => {
      await ssh.connect({ host: vm.mainIp, username: 'root', password: request.resourceContext.password });
      return true;
    });

    reporter.appendContext({
      host: vm.mainIp!,
      sshUser: 'root',
      sshPassword: request.resourceContext.password,
    });

    reporter.appendConnection({
      ip: {
        value: vm.mainIp!,
        label: 'IP Address',
        isPublic: true,
      },
    });
  }

  private async createInstance(
    vultr: VultrClient,
    label: string,
    request: ResourceRequest<Parameters, ResourceContext>,
    reporter: ResourceReporter,
  ) {
    const { backup, region, plan, app } = request.parameters;

    const backups = backup ? 'enabled' : 'disabled';

    reporter.beginStep('Creating instance');

    let vm = await findInstance(vultr, label);
    if (vm) {
      if (plan !== vm.plan) {
        await vultr.instances.updateInstance(vm.id!, { plan });
      }

      reporter.beginStep('Waiting for instance to become ready');
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

      reporter.beginStep('Waiting for instance to become ready');
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
      return { metrics: await collectVmMetrics(ssh) };
    } finally {
      ssh.dispose();
    }
  }
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
