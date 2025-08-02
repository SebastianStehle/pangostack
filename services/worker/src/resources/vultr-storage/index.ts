import { Injectable } from '@nestjs/common';
import VultrNode from '@vultr/vultr-node';
import { Resource, ResourceApplyResult, ResourceDescriptor, ResourceRequest, ResourceStatusResult, ResourceUsage } from '../interface';

@Injectable()
export class VultrStorageResource implements Resource {
  descriptor: ResourceDescriptor = {
    name: 'vultr-storage',
    description: 'Creates a vultr storage account',
    parameters: {
      apiKey: {
        description: 'The API Key',
        type: 'string',
        required: true,
      },
      cluster: {
        description: 'The location of the storage account',
        type: 'string',
        required: true,
      },
      The: {
        description: 'The tier of the storage account',
        type: 'string',
        required: true,
      },
    },
  };

  async apply(id: string, request: ResourceRequest): Promise<ResourceApplyResult> {
    const { apiKey, cluster, tier } = request.parameters as { apiKey: string; cluster: string; tier: string };

    const vultr = VultrNode.initialize({
      apiKey,
    });

    try {
      const result = await vultr.blockStorage.createStorage({
        cluster_id: cluster,
        tier_id: tier,
        label: id,
      });

      return {
        context: {
          s3_hostname: result.s3_hostname,
          s3_access_key: result.s3_access_key,
          s3_secret_key: result.s3_secret_key,
        },
        connection: {
          hostName: {
            value: result.s3_hostname,
            label: 'Host Name',
          },
          accessKey: {
            value: result.s3_access_key,
            label: 'Access Key',
          },
          secretKey: {
            value: result.s3_secret_key,
            label: 'Secret Key',
          },
        },
      };
    } catch (ex: any) {
      return { context: {}, connection: {} };
    }
  }

  async delete(id: string, request: ResourceRequest) {
    const { apiKey } = request.parameters as { apiKey: string };

    const vultr = VultrNode.initialize({
      apiKey,
    });

    const storage = await findStorage(vultr, id);
    if (!storage) {
      return;
    }

    await vultr.blockStorage.deleteStorage({ id: storage.id });
  }

  async usage(id: string, request: ResourceRequest): Promise<ResourceUsage> {
    const { apiKey } = request.parameters as { apiKey: string };

    const vultr = VultrNode.initialize({
      apiKey,
    });

    const storage = await findStorage(vultr, id);
    return { totalStorageGB: storage?.size_gb || 0 };
  }

  async status(id: string, request: ResourceRequest): Promise<ResourceStatusResult> {
    const { apiKey } = request.parameters as { apiKey: string };

    const vultr = VultrNode.initialize({
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

async function findStorage(vultr: ReturnType<typeof VultrNode.initialize>, id: string) {
  let cursor: string | null = null;
  while (true) {
    const response = await vultr.blockStorage.listStorages({ cursor });

    for (const storage of response.object_storages) {
      if (storage.label === id) {
        return storage;
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
