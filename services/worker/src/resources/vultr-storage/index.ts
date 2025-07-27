import { Injectable } from '@nestjs/common';
import VultrNode from '@vultr/vultr-node';
import { Resource, ResourceApplyResult, ResourceDescriptor, ResourceRequest, ResourceStatusResult } from '../interface';

@Injectable()
export class VultrStorageResource implements Resource {
  descriptor: ResourceDescriptor = {
    name: 'vultr-action',
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
          s3_hostname: result,
          s3_access_key: result,
          s3_secret_key: result,
        },
      };
    } catch (ex: any) {
      return { context: {} };
    }
  }

  async delete(id: string, request: ResourceRequest) {
    const { apiKey } = request.parameters as { apiKey: string };

    const vultr = VultrNode.initialize({
      apiKey,
    });

    let cursor: string | null = null;
    while (true) {
      const response = await vultr.blockStorage.listStorages({ cursor });

      for (const storage of response.object_storages) {
        if (storage.label === id) {
          await vultr.blockStorage.deleteStorage({ id: storage.id });
          break;
        }
      }

      const newCursor = response.meta.links.next;
      if (!cursor || newCursor === cursor) {
        break;
      }

      cursor = newCursor;
    }
  }

  async status(id: string, request: ResourceRequest): Promise<ResourceStatusResult> {
    const { apiKey } = request.parameters as { apiKey: string };

    const vultr = VultrNode.initialize({
      apiKey,
    });

    let cursor: string | null = null;
    while (true) {
      const response = await vultr.blockStorage.listStorages({ cursor });

      for (const storage of response.object_storages) {
        if (storage.label === id) {
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
        }

        break;
      }

      const newCursor = response.meta.links.next;
      if (!cursor || newCursor === cursor) {
        break;
      }

      cursor = newCursor;
    }

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
