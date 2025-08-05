import { Injectable } from '@nestjs/common';
import { initialize as initializeVultrClient } from '@vultr/vultr-node';
import { defineResource, Resource, ResourceApplyResult, ResourceRequest, ResourceStatusResult, ResourceUsage } from '../interface';

type Parameters = { apiKey: string; region: string; plan: string; app: number };

@Injectable()
export class VultrInstanceResource implements Resource {
  descriptor = defineResource<Parameters>({
    name: 'vultr-instance',
    description: 'Creates a vultr instance',
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
        type: 'number',
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

  async apply(id: string, request: ResourceRequest<Parameters>): Promise<ResourceApplyResult> {
    const { apiKey, region, plan, app, ...others } = request.parameters;

    const vultr = initializeVultrClient({
      apiKey,
    });

    let instance = await findInstance(vultr, id);

    if (instance) {
      await vultr.instances.updateInstance({ 'instance-id': id, plan });
    } else {
      instance = await vultr.instances.createInstance({
        app_id: app,
        plan,
        region,
        app_variables: others,
      });
    }

    const statusTimeout = 5 * 60 * 1000;
    const statusStart = new Date();
    while (true) {
      instance = await vultr.instances.getInstance(instance.id);

      if (instance.server_status === 'ok' && !!instance.main_ip) {
        break;
      }

      const now = new Date();
      if (now.getTime() - statusStart.getTime() > statusTimeout) {
        throw new Error('Timeout: Instance did not become ready within 5 minutes.');
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    return {
      context: {},
      connection: {
        ip: {
          value: instance.main_ip,
          label: 'IP Address',
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

  async status(id: string, request: ResourceRequest): Promise<ResourceStatusResult> {
    const { apiKey } = request.parameters as { apiKey: string };

    const vultr = initializeVultrClient({
      apiKey,
    });

    const instance = await findInstance(vultr, id);
    if (instance) {
      const status: ResourceStatusResult = {
        workloads: [
          {
            name: 'Instance',
            nodes: [
              {
                name: 'Virtual Machine',
                isReady: instance.status === 'ok' && !!instance.main_ip,
              },
            ],
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

async function findInstance(vultr: ReturnType<typeof initializeVultrClient>, id: string) {
  let cursor: string | null = null;
  while (true) {
    const response = await vultr.instances.listInstances({ cursor });

    for (const instance of response.object_storages) {
      if (instance.label === id) {
        return instance;
      }

      break;
    }

    const newCursor = response.meta.links.next;
    if (!cursor || newCursor === cursor) {
      break;
    }

    cursor = newCursor;
  }

  return null;
}
