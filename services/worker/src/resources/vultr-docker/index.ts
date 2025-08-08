import { Injectable } from '@nestjs/common';
import { initialize as initializeVultrClient } from '@vultr/vultr-node';
import { NodeSSH } from 'node-ssh';
import { deployDocker, getContainers, pollUntil } from 'src/lib';
import { defineResource, Resource, ResourceApplyResult, ResourceRequest, ResourceStatusResult, ResourceUsage } from '../interface';

type Parameters = { apiKey: string; region: string; plan: string; app: string; dockerComposeUrl: string };

type Context = { password: string };

// 5 minutes
const DEFAULT_TIMEOUT = 10 * 60 * 1000;

@Injectable()
export class VultrDockerResource implements Resource {
  descriptor = defineResource<Parameters>({
    name: 'vultr-docker',
    description: 'Creates a vultr instance with docker compose',
    parameters: {
      apiKey: {
        description: 'The API Key',
        type: 'string',
        required: true,
      },
      region: {
        description: 'The name of the region',
        type: 'string',
        required: true,
      },
      plan: {
        description: 'The name of the plan',
        type: 'string',
        required: true,
      },
      app: {
        description: 'The ID of the app from the marketplace',
        type: 'string',
        required: true,
      },
      dockerComposeUrl: {
        description: 'The URL of the docker compose file',
        type: 'string',
        required: true,
      },
    },
  });

  async describe(): Promise<any> {
    const vultr = initializeVultrClient({ apiKey: 'NONE' });

    const [{ plans }, { regions }] = await Promise.all([
      await (await fetch('https://api.vultr.com/v2/plans?type=vc2')).json(),
      vultr.regions.listRegions({}),
    ]);

    return { plans, regions };
  }

  async apply(id: string, request: ResourceRequest<Parameters, Context>): Promise<ResourceApplyResult> {
    const { apiKey, dockerComposeUrl, region, plan, app, ...others } = request.parameters;

    const vultr = initializeVultrClient({
      apiKey,
    });

    const context = request.context;

    let instance = await findInstance(vultr, id);
    if (instance) {
      await vultr.instances.updateInstance({ 'instance-id': id, plan });
    } else {
      const response = await vultr.instances.createInstance({
        image_id: app.toString(),
        plan,
        region,
        label: id,
      });

      instance = response.instance;
      context.password = instance.default_password;
    }

    await waitForInstance(vultr, instance);

    const ssh = new NodeSSH();
    await pollUntil(DEFAULT_TIMEOUT, async () => {
      await ssh.connect({ host: instance.main_ip, password: context.password!, username: 'root' });
      return true;
    });

    await deployDocker(ssh, dockerComposeUrl, others, DEFAULT_TIMEOUT);

    return {
      context,
      connection: {
        ip: {
          value: instance.main_ip,
          label: 'IP Address',
          isPublic: true,
        },
      },
    };
  }

  async delete(id: string, request: ResourceRequest<Parameters>) {
    const { apiKey } = request.parameters;

    const vultr = initializeVultrClient({
      apiKey,
    });

    const instance = await findInstance(vultr, id);
    if (!instance) {
      return;
    }

    await vultr.instances.deleteInstance({ id: instance.id });
  }

  usage(): Promise<ResourceUsage> {
    return Promise.resolve({ totalStorageGB: 0 });
  }

  async status(id: string, request: ResourceRequest<Parameters, Context>): Promise<ResourceStatusResult> {
    const { apiKey } = request.parameters;

    const vultr = initializeVultrClient({
      apiKey,
    });

    const instance = await findInstance(vultr, id);
    if (instance) {
      const ssh = new NodeSSH();
      await ssh.connect({ host: instance.main_ip, username: 'root', password: request.context.password! });

      const containers = await getContainers(ssh);

      const status: ResourceStatusResult = {
        workloads: [
          {
            name: 'Virtual Machine',
            nodes: containers,
          },
        ],
      };

      return status;
    } else {
      const status: ResourceStatusResult = {
        workloads: [
          {
            name: 'Instance',
            nodes: [
              {
                name: 'Virtual Machine',
                isReady: false,
                message: 'Instance not found',
              },
            ],
          },
        ],
      };

      return status;
    }
  }
}

async function waitForInstance(vultr: ReturnType<typeof initializeVultrClient>, instance: any) {
  const instanceId = instance.id;

  const statusTimeout = 5 * 60 * 1000;
  const statusStart = new Date();

  while (true) {
    const found = await vultr.instances.getInstance({ 'instance-id': instanceId });
    instance = found.instance;

    if (instance.server_status === 'ok' && !!instance.main_ip) {
      break;
    }

    const now = new Date();
    if (now.getTime() - statusStart.getTime() > statusTimeout) {
      throw new Error('Timeout: Instance did not become ready within 5 minutes.');
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

async function findInstance(vultr: ReturnType<typeof initializeVultrClient>, id: string) {
  let cursor: string | null = null;
  while (true) {
    const response = await vultr.instances.listInstances({ cursor });

    for (const instance of response.instances) {
      if (instance.label === id) {
        return instance;
      }
    }

    const newCursor = response.meta.links.next;
    if (!cursor || newCursor === cursor) {
      break;
    }

    cursor = newCursor;
  }

  return null;
}
