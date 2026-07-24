import { Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { defineResource, Resource, ResourceReporter, ResourceRequest, ResourceStatusResult } from '../interface';

type Parameters = { credentialsJson: string; projectId: string; bucket: string; location?: string };

type Context = { gcpProjectId: string; gcpBucket: string; gcpCredentialsJson: string };

const BUCKET_ALREADY_EXISTS_CODE = 409;

@Injectable()
export class GcpStorageResource implements Resource {
  descriptor = defineResource<Parameters, Context>({
    name: 'gcp-storage',
    description: 'Creates a Google Cloud Storage bucket.',
    parameters: {
      credentialsJson: {
        description: 'The service account key as a JSON string.',
        type: 'string',
        required: true,
      },
      projectId: {
        description: 'The Google Cloud project id.',
        type: 'string',
        required: true,
      },
      bucket: {
        description: 'The globally unique name of the bucket.',
        type: 'string',
        required: true,
      },
      location: {
        description: 'The location of the bucket, for example EU or US.',
        type: 'string',
        required: false,
      },
    },
    context: {
      gcpProjectId: {
        description: 'The Project Id.',
        type: 'string',
        required: true,
      },
      gcpBucket: {
        description: 'The Bucket.',
        type: 'string',
        required: true,
      },
      gcpCredentialsJson: {
        description: 'The Credentials.',
        type: 'string',
        required: true,
      },
    },
  });

  async apply(_: string, request: ResourceRequest<Parameters>, reporter: ResourceReporter): Promise<void> {
    const { credentialsJson, projectId, bucket, location } = request.parameters;

    const storage = createClient(request.parameters);

    reporter.beginStep(`Creating bucket ${bucket}`);
    try {
      await storage.createBucket(bucket, { location });
      reporter.report('Bucket created successfully', { log: true });
    } catch (ex: unknown) {
      // A 409 means the bucket already exists from a previous apply, which is the idempotent case.
      if (getErrorCode(ex) !== BUCKET_ALREADY_EXISTS_CODE) {
        throw ex;
      } else {
        reporter.report('Bucket already exists', { log: true });
      }
    }

    reporter.appendContext({
      gcpProjectId: projectId,
      gcpBucket: bucket,
      gcpCredentialsJson: credentialsJson,
    });

    reporter.appendConnection({
      projectId: {
        value: projectId,
        label: 'Project Id',
        isPublic: true,
      },
      bucket: {
        value: bucket,
        label: 'Bucket',
        isPublic: true,
      },
    });
  }

  async delete(_: string, request: ResourceRequest<Parameters>) {
    const { bucket } = request.parameters;

    const storage = createClient(request.parameters);
    try {
      await storage.bucket(bucket).delete();
    } catch (ex: unknown) {
      if (getErrorCode(ex) !== NOT_FOUND_CODE) {
        throw ex;
      }
    }
  }

  async status(_: string, request: ResourceRequest<Parameters>): Promise<ResourceStatusResult> {
    const { bucket } = request.parameters;

    const storage = createClient(request.parameters);

    let failure: string | undefined = undefined;
    try {
      const [exists] = await storage.bucket(bucket).exists();
      if (!exists) {
        failure = 'Bucket not found';
      }
    } catch (ex: unknown) {
      failure = `Bucket is not accessible: ${ex instanceof Error ? ex.message : String(ex)}`;
    }

    return {
      workloads: [
        {
          name: 'Default',
          nodes: [
            {
              name: 'Object Storage',
              isReady: !failure,
              message: failure,
            },
          ],
        },
      ],
    };
  }
}

const NOT_FOUND_CODE = 404;

function createClient(parameters: Parameters) {
  const { credentialsJson, projectId } = parameters;

  return new Storage({ projectId, credentials: JSON.parse(credentialsJson) });
}

function getErrorCode(ex: unknown): number | undefined {
  return (ex as { code?: number })?.code;
}
