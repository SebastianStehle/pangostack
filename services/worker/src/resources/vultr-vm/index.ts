import { Injectable, Logger } from '@nestjs/common';
import { initialize as initializeVultrClient } from '@vultr/vultr-node';
import { NodeSSH } from 'node-ssh';
import { pollUntil } from 'src/lib';
import { defineResource, Resource, ResourceApplyResult, ResourceRequest, ResourceStatusResult } from '../interface';

type Parameters = { apiKey: string; region: string; plan: string; app: string };

type Context = { password: string };

@Injectable()
export class VultrVmResource implements Resource {
  private readonly logger = new Logger(VultrVmResource.name);

  descriptor = defineResource<Parameters>({
    name: 'vultr-vm',
    description: 'Creates a vultr virtual',
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
    const { apiKey, region, plan, app } = request.parameters;

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

        if (!instance) {
          this.logger.error({ message: `Instance could not be deployed: ${response.message}`, context: logContext });
          throw Error('Failed to deploy instance');
        }

        instance = response.instance;
        this.logger.log({ message: 'Using new instance', context: logContext });

        if (instance.default_password) {
          request.resourceContext.password = instance.default_password;
        }
      }

      if (isValidIp(instance.main_ip)) {
        logContext.ip = instance.main_ip;
      }

      this.logger.log({ message: 'Waiting for VM details to be ready', context: logContext });
      instance = await waitForInstance(vultr, instance, request.timeoutMs, !!request.resourceContext.password);

      if (isValidIp(instance.main_ip)) {
        logContext.ip = instance.main_ip;
      }

      const ssh = new NodeSSH();
      this.logger.log({
        message: 'VM details are available, but the VM might not be running yet. Waiting for SSH connection',
        context: logContext,
      });
      await pollUntil(request.timeoutMs, async () => {
        await ssh.connect({ host: instance.main_ip, username: 'root', password: request.resourceContext.password });
        return true;
      });

      return {
        resourceContext: request.resourceContext,
        context: {
          host: instance.main_ip,
          sshUser: 'root',
          sshPassword: request.resourceContext.password,
        },
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

  async status(id: string, request: ResourceRequest<Parameters, Context>): Promise<ResourceStatusResult> {
    const { apiKey } = request.parameters;

    const vultr = initializeVultrClient({
      apiKey,
    });

    const instance = await findInstance(vultr, id);

    let failure: string | undefined = undefined;
    if (!instance) {
      failure = 'Instance not found';
    } else if (!isActiveStatus(instance)) {
      failure = `Instance does not have success status, got ${instance.server_status}`;
    } else if (!isValidIp(instance)) {
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
}

async function waitForInstance(vultr: ReturnType<typeof initializeVultrClient>, instance: any, timeout: number, hasPassword: boolean) {
  const instanceId = instance.id;

  await pollUntil(timeout, async () => {
    const { instance } = await vultr.instances.getInstance({ 'instance-id': instanceId });

    return isActiveStatus(instance) && isValidIp(instance) && (hasPassword || instance.default_password);
  });

  const { instance: newInstane } = await vultr.instances.getInstance({ 'instance-id': instanceId });
  return newInstane;
}

function isActiveStatus(instance: any) {
  return instance.server_status === 'ok' || instance.server_status === 'active';
}

function isValidIp(instance: any) {
  return instance.main_ip && instance.main_ip !== '0.0.0.0';
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
