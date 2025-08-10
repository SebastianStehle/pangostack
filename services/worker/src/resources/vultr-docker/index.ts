import { Injectable, Logger } from '@nestjs/common';
import { initialize as initializeVultrClient } from '@vultr/vultr-node';
import { NodeSSH } from 'node-ssh';
import { deployDocker, getContainers, pollUntil } from 'src/lib';
import { defineResource, Resource, ResourceApplyResult, ResourceRequest, ResourceStatusResult, ResourceUsage } from '../interface';

type Parameters = { apiKey: string; region: string; plan: string; app: string; dockerComposeUrl: string };

type Context = { password: string };

// 5 minutes
const DEFAULT_TIMEOUT = 15 * 60 * 1000;

@Injectable()
export class VultrDockerResource implements Resource {
  private readonly logger = new Logger(VultrDockerResource.name);

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

    const logContext: any = { id };
    try {
      const vultr = initializeVultrClient({
        apiKey,
      });

      this.logger.log({ message: 'Deploying resource', context: logContext });

      let instance = await findInstance(vultr, id);
      if (instance) {
        await vultr.instances.updateInstance({ 'instance-id': id, plan });
        this.logger.log({ message: 'Using existing instance', context: logContext });
      } else {
        const response = await vultr.instances.createInstance({
          image_id: app.toString(),
          plan,
          region,
          label: id,
        });

        instance = response.instance;
        this.logger.log({ message: 'Using new instance', context: logContext });
      }

      const context = request.context;

      await waitForInstance(vultr, instance, !!context.password);
      logContext.ip = instance.main_ip;

      if (instance.default_password) {
        context.password = instance.default_password;
      }

      this.logger.log({ message: 'Instance ready to be used, waiting for SSH connection', context: logContext });

      const ssh = new NodeSSH();
      try {
        await pollUntil(DEFAULT_TIMEOUT, async () => {
          await ssh.connect({ host: instance.main_ip, password: context.password!, username: 'root' });
          return true;
        });

        this.logger.log({ message: 'Instance accepted SSH connection, deploying docker', context: logContext });
        await deployDocker(ssh, dockerComposeUrl, others, DEFAULT_TIMEOUT, (message) => {
          this.logger.log({ message, context: logContext });
        });
      } finally {
        ssh.dispose();
      }

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
    } catch (ex: any) {
      this.logger.error({ message: `Instance could not be deployed: ${ex.message}`, context: logContext });
      throw ex;
    }
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

async function waitForInstance(vultr: ReturnType<typeof initializeVultrClient>, instance: any, hasPassword: boolean) {
  const instanceId = instance.id;

  await pollUntil(DEFAULT_TIMEOUT, async () => {
    const { instance } = await vultr.instances.getInstance({ 'instance-id': instanceId });

    return (
      instance.server_status === 'ok' && instance.main_ip && instance.main_ip !== '0.0.0.0' && (hasPassword || instance.default_password)
    );
  });

  const { instance: newInstane } = await vultr.instances.getInstance({ 'instance-id': instanceId });
  return newInstane;
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
