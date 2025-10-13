import { BucketAlreadyExists, CreateBucketCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { pollUntil } from 'src/lib';
import { VultrClient } from 'src/lib/vultr';
import { ObjectStorage } from 'src/lib/vultr/generated';
import {
  defineResource,
  LogContext,
  Resource,
  ResourceApplyResult,
  ResourceRequest,
  ResourceStatusResult,
  ResourceUsage,
} from '../interface';

type Parameters = { apiKey: string; cluster: number; tier: number; bucket?: string };

type Context = { s3HostName: string; s3AccessKey: string; s3SecretKey: string };

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
        type: 'number',
        required: true,
      },
      tier: {
        description: 'The tier of the storage account.',
        type: 'number',
        required: true,
      },
      bucket: {
        description: 'The optional bucket to create.',
        type: 'string',
        required: false,
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
    },
  });

  async apply(id: string, request: ResourceRequest<Parameters>, logContext: LogContext): Promise<ResourceApplyResult<Context>> {
    const { apiKey, bucket, cluster, tier } = request.parameters;

    const vultr = new VultrClient(apiKey);

    let storage = await findStorage(vultr, id);
    if (storage) {
      this.logger.log({ message: 'Using existing storage, waiting for storage details to be ready', context: logContext });
      storage = await waitForStorage(vultr, storage, request.timeoutMs);
    } else {
      const response = await vultr.objectStorages.createObjectStorage({ clusterId: cluster, tierId: tier, label: id });
      storage = response.objectStorage!;

      this.logger.log({ message: 'Using new storage, waiting for storage details to be ready', context: logContext });
      storage = await waitForStorage(vultr, storage, request.timeoutMs);
    }

    if (bucket) {
      logContext.bucket = bucket;

      const s3Client = new S3Client({
        region: 'us-east-1',
        credentials: { accessKeyId: storage.s3AccessKey!, secretAccessKey: storage.s3SecretKey! },
        endpoint: `https://${storage.s3Hostname}`,
      });

      try {
        const command = new CreateBucketCommand({ Bucket: bucket });
        await s3Client.send(command);
        this.logger.log({ message: 'Bucket created successfully', context: logContext });
      } catch (ex: unknown) {
        if (!(ex instanceof BucketAlreadyExists)) {
          throw ex;
        } else {
          this.logger.log({ message: 'Bucket already exists', context: logContext });
        }
      }
    }

    return {
      context: {
        s3HostName: storage.s3Hostname!,
        s3AccessKey: storage.s3AccessKey!,
        s3SecretKey: storage.s3SecretKey!,
      },
      connection: {
        hostName: {
          value: storage.s3Hostname!,
          label: 'Host Name',
          isPublic: true,
        },
        accessKey: {
          value: storage.s3AccessKey!,
          label: 'Access Key',
          isPublic: false,
        },
        secretKey: {
          value: storage.s3SecretKey!,
          label: 'Secret Key',
          isPublic: false,
        },
      },
    };
  }

  async delete(id: string, request: ResourceRequest<Parameters>) {
    const { apiKey } = request.parameters;

    const vultr = new VultrClient(apiKey);
    const storage = await findStorage(vultr, id);
    if (!storage) {
      return;
    }

    await vultr.objectStorages.deleteObjectStorage(storage.id!);
  }

  async usage(id: string, request: ResourceRequest<Parameters>): Promise<ResourceUsage> {
    const { apiKey, bucket } = request.parameters;

    if (!bucket) {
      return { totalStorageGB: 0 };
    }

    const vultr = new VultrClient(apiKey);
    const storage = await findStorage(vultr, id);
    if (!storage) {
      return { totalStorageGB: 0 };
    }

    const s3Client = new S3Client({
      region: 'us-east-1',
      credentials: { accessKeyId: storage.s3AccessKey!, secretAccessKey: storage.s3SecretKey! },
      endpoint: `https://${storage.s3Hostname}`,
    });

    let continuationToken: string | undefined = undefined;
    let totalSize = 0;
    do {
      const command: ListObjectsV2Command = new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(command);
      if (response.Contents) {
        for (const obj of response.Contents) {
          totalSize += obj.Size ?? 0;
        }
      }

      continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken);

    return { totalStorageGB: totalSize / (1024 * 1024) };
  }

  async status(id: string, request: ResourceRequest<Parameters>): Promise<ResourceStatusResult> {
    const { apiKey } = request.parameters;

    const vultr = new VultrClient(apiKey);
    const storage = await findStorage(vultr, id);

    let failure: string | undefined = undefined;
    if (!storage) {
      failure = 'Storage not found';
    } else if (!isActiveStatus(storage)) {
      failure = `Storage does not have success status, got ${storage.status}`;
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

async function waitForStorage(vultr: VultrClient, instance: any, timeout: number) {
  const storageId = instance.id;

  await pollUntil(timeout, async () => {
    const { objectStorage: storage } = await vultr.objectStorages.getObjectStorage(storageId);

    return isActiveStatus(storage);
  });

  const { objectStorage: newStorage } = await vultr.objectStorages.getObjectStorage(storageId);
  return newStorage!;
}

function isActiveStatus(storage: ObjectStorage | undefined) {
  return storage?.status === 'ok' || storage?.status === 'active';
}

async function findStorage(vultr: VultrClient, id: string) {
  let cursor: string | undefined = undefined;
  while (true) {
    const response = await vultr.objectStorages.listObjectStorages(undefined, cursor);

    if (response.objectStorages) {
      for (const storage of response.objectStorages) {
        if (storage.label === id) {
          return storage;
        }
      }
    }

    const newCursor = response.meta?.links?.next;
    if (!cursor || newCursor === cursor) {
      break;
    }

    cursor = newCursor;
  }

  return null;
}
