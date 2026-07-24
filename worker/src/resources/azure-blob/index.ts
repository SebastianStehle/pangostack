import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { defineResource, Resource, ResourceReporter, ResourceRequest, ResourceStatusResult } from '../interface';

type Parameters = { accountName: string; accountKey: string; container: string };

type Context = { azureAccountName: string; azureAccountKey: string; azureContainer: string };

// Usage is intentionally not reported: with data-plane (account key) access the only way to size a
// container is to enumerate every blob, and the cheap BlobCapacity metric requires management-plane
// (ARM) access this resource does not have.
@Injectable()
export class AzureBlobResource implements Resource {
  descriptor = defineResource<Parameters, Context>({
    name: 'azure-blob',
    description: 'Creates a container in an Azure Blob Storage account.',
    parameters: {
      accountName: {
        description: 'The name of the storage account.',
        type: 'string',
        required: true,
      },
      accountKey: {
        description: 'The access key of the storage account.',
        type: 'string',
        required: true,
      },
      container: {
        description: 'The name of the container to create.',
        type: 'string',
        required: true,
      },
    },
    context: {
      azureAccountName: {
        description: 'The Account Name.',
        type: 'string',
        required: true,
      },
      azureAccountKey: {
        description: 'The Account Key.',
        type: 'string',
        required: true,
      },
      azureContainer: {
        description: 'The Container.',
        type: 'string',
        required: true,
      },
    },
  });

  async apply(_: string, request: ResourceRequest<Parameters>, reporter: ResourceReporter): Promise<void> {
    const { accountName, accountKey, container } = request.parameters;

    const service = createClient(request.parameters);

    reporter.beginStep(`Creating container ${container}`);

    const containerClient = service.getContainerClient(container);
    const { succeeded } = await containerClient.createIfNotExists();
    reporter.report(succeeded ? 'Container created successfully' : 'Container already exists', { log: true });

    reporter.appendContext({
      azureAccountName: accountName,
      azureAccountKey: accountKey,
      azureContainer: container,
    });

    reporter.appendConnection({
      accountName: {
        value: accountName,
        label: 'Account Name',
        isPublic: true,
      },
      container: {
        value: container,
        label: 'Container',
        isPublic: true,
      },
      endpoint: {
        value: containerClient.url,
        label: 'Endpoint',
        isPublic: true,
      },
      accountKey: {
        value: accountKey,
        label: 'Account Key',
        isPublic: false,
      },
    });
  }

  async delete(_: string, request: ResourceRequest<Parameters>) {
    const { container } = request.parameters;

    const service = createClient(request.parameters);
    await service.getContainerClient(container).deleteIfExists();
  }

  async status(_: string, request: ResourceRequest<Parameters>): Promise<ResourceStatusResult> {
    const { container } = request.parameters;

    const service = createClient(request.parameters);

    let failure: string | undefined = undefined;
    try {
      const exists = await service.getContainerClient(container).exists();
      if (!exists) {
        failure = 'Container not found';
      }
    } catch (ex: unknown) {
      failure = `Container is not accessible: ${ex instanceof Error ? ex.message : String(ex)}`;
    }

    return {
      workloads: [
        {
          name: 'Default',
          nodes: [
            {
              name: 'Blob Storage',
              isReady: !failure,
              message: failure,
            },
          ],
        },
      ],
    };
  }
}

function createClient(parameters: Parameters) {
  const { accountName, accountKey } = parameters;

  const credential = new StorageSharedKeyCredential(accountName, accountKey);

  return new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, credential);
}
