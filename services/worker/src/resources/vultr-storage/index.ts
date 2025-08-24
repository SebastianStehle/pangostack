import { Injectable } from '@nestjs/common';
import { initialize as initializeVultrClient } from '@vultr/vultr-node';
import { defineResource, Resource, ResourceApplyResult, ResourceRequest, ResourceStatusResult, ResourceUsage } from '../interface';

type Parameters = { apiKey: string; cluster: string; tier: string };

type Context = { s3HostName: string; s3AccessKey: string; s3SecretKey: string; }

@Injectable()
export class VultrStorageResource implements Resource {
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
        type: 'string',
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

    const vultr = initializeVultrClient({
      apiKey,
    });

    const result = await vultr.blockStorage.createStorage({
      cluster_id: cluster,
      tier_id: tier,
      label: id,
    });

    return {
      context: {
        s3HostName: result.s3_hostname,
        s3AccessKey: result.s3_access_key,
        s3SecretKey: result.s3_secret_key,
      },
      connection: {
        hostName: {
          value: result.s3_hostname,
          label: 'Host Name',
          isPublic: true,
        },
        accessKey: {
          value: result.s3_access_key,
          label: 'Access Key',
          isPublic: true,
        },
        secretKey: {
          value: result.s3_secret_key,
          label: 'Secret Key',
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

async function findStorage(vultr: ReturnType<typeof initializeVultrClient>, id: string) {
  let cursor: string | null = null;
  while (true) {
    const response = await vultr.blockStorage.listStorages({ cursor });

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
