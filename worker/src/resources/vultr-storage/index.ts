import { Injectable, Logger } from '@nestjs/common';
import { initialize as initializeVultrClient } from '@vultr/vultr-node';
import { defineResource, Resource, ResourceApplyResult, ResourceRequest, ResourceStatusResult, ResourceUsage } from '../interface';
import { pollUntil } from 'src/lib';

type Parameters = { apiKey: string; cluster: string; tier: number };

type Context = { s3HostName: string; s3AccessKey: string; s3SecretKey: string; }

@Injectable()
export class VultrStorageResource implements Resource {
  private readonly logger = new Logger(VultrStorageResource.name);

  descriptor = defineResource<Parameters, Context>({
    name: 'vultr-storage',
    description: 'Creates a vultr storage account.',
    parameters: {
      apiKey: {
        description: 'The API Key.',
        type: 'string',
        required: true,
      },
      cluster: {
        description: 'The location of the storage account.',
        type: 'string',
        required: true,
      },
      tier: {
        description: 'The tier of the storage account.',
        type: 'number',
        required: true,
      },
    },
    context: {
      s3HostName: {
        description: 'The Host Name.',
        type: 'string',
        required: true,
      },
      s3AccessKey: {
        description: 'The Access Key.',
        type: 'string',
        required: true,
      },
      s3SecretKey: {
        description: 'The Secret Key.',
        type: 'string',
        required: true,
      },
    }
  });

  async apply(id: string, request: ResourceRequest<Parameters>): Promise<ResourceApplyResult<Context>> {
    const { apiKey, cluster, tier } = request.parameters;

    const logContext: any = { id };
    try {
      const vultr = initializeVultrClient({
        apiKey,
      });

      let storage = await findStorage(vultr, id);
      if (storage) {
        this.logger.log({ message: 'Using existing storage, waiting for storage details to be ready', context: logContext });
        storage = await waitForInstance(vultr, storage, request.timeoutMs);
      } else {
        const response = await vultr.objectStorage.createObjectStorage({
          cluster_id: cluster,
          tier_id: tier,
          label: id,
        });

        if (response instanceof Error) {
          const message = `Failed to create storage:\n${response.message}`;

          this.logger.error({ message, context: logContext });
          throw Error(message);
        }

        this.logger.log({ message: 'Using new storage, waiting for storage details to be ready', context: logContext });
        storage = await waitForInstance(vultr, storage, request.timeoutMs);
      }

      return {
        context: {
          s3HostName: storage.s3_hostname,
          s3AccessKey: storage.s3_access_key,
          s3SecretKey: storage.s3_secret_key,
        },
        connection: {
          hostName: {
            value: storage.s3_hostname,
            label: 'Host Name',
            isPublic: true,
          },
          accessKey: {
            value: storage.s3_access_key,
            label: 'Access Key',
            isPublic: true,
          },
          secretKey: {
            value: storage.s3_secret_key,
            label: 'Secret Key',
            isPublic: true,
          },
        },
      };
    } catch (ex: any) {
      this.logger.error({ message: `Storage could not be deployed: ${ex.message}`, context: logContext });
      throw ex;
    }
  }

  async delete(id: string, request: ResourceRequest<Parameters>) {
    const { apiKey } = request.parameters;

    const vultr = initializeVultrClient({
      apiKey,
    });

    const storage = await findStorage(vultr, id);
    if (!storage) {
      return;
    }

    await vultr.blockStorage.deleteStorage({ id: storage.id });
  }

  async usage(id: string, request: ResourceRequest<Parameters>): Promise<ResourceUsage> {
    const { apiKey } = request.parameters;

    const vultr = initializeVultrClient({
      apiKey,
    });

    const storage = await findStorage(vultr, id);
    return { totalStorageGB: storage?.size_gb || 0 };
  }

  async status(id: string, request: ResourceRequest<Parameters>): Promise<ResourceStatusResult> {
    const { apiKey } = request.parameters;

    const vultr = initializeVultrClient({
      apiKey,
    });

    const storage = await findStorage(vultr, id);
    if (storage) {
      const status: ResourceStatusResult = {
        workloads: [
          {
            name: 'Storage Account',
            nodes: [
              {
                name: 'Storage Account',
                isReady: true,
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
            name: 'Storage Account',
            nodes: [
              {
                name: 'Storage Account',
                isReady: false,
                message: 'Storage account not found',
              },
            ],
          },
        ],
      };

      return status;
    }
  }
}

async function waitForInstance(vultr: ReturnType<typeof initializeVultrClient>, instance: any, timeout: number) {
  const storageId = instance.id;

  await pollUntil(timeout, async () => {
    const { object_storage: storage } = await vultr.objectStorage.getObjectStorage({ 'object-storage-id': storageId });

    return isActiveStatus(storage);
  });

  const { object_storage: newStorage } = await vultr.instances.getInstance({ 'object-storage-id': storageId });
  return newStorage;
}

function isActiveStatus(storage: any) {
  return storage.server_status === 'ok' || storage.server_status === 'active';
}

async function findStorage(vultr: ReturnType<typeof initializeVultrClient>, id: string) {
  let cursor: string | null = null;
  while (true) {
    const response = await vultr.objectStorage.listObjectStorages({ cursor });

    for (const storage of response.object_storages) {
      if (storage.label === id) {
        return storage;
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
