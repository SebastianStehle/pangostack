import {
  BucketAlreadyOwnedByYou,
  BucketLocationConstraint,
  CreateBucketCommand,
  DeleteBucketCommand,
  HeadBucketCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { defineResource, Resource, ResourceReporter, ResourceRequest, ResourceStatusResult } from '../interface';

type Parameters = { accessKeyId: string; secretAccessKey: string; region: string; bucket: string };

type Context = { s3Region: string; s3Bucket: string; s3AccessKey: string; s3SecretKey: string };

@Injectable()
export class AwsS3Resource implements Resource {
  descriptor = defineResource<Parameters, Context>({
    name: 'aws-s3',
    description: 'Creates an AWS S3 bucket.',
    parameters: {
      accessKeyId: {
        description: 'The AWS access key id.',
        type: 'string',
        required: true,
      },
      secretAccessKey: {
        description: 'The AWS secret access key.',
        type: 'string',
        required: true,
      },
      region: {
        description: 'The AWS region, for example eu-central-1.',
        type: 'string',
        required: true,
      },
      bucket: {
        description: 'The globally unique name of the bucket.',
        type: 'string',
        required: true,
      },
    },
    context: {
      s3Region: {
        description: 'The Region.',
        type: 'string',
        required: true,
      },
      s3Bucket: {
        description: 'The Bucket.',
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

  async apply(_: string, request: ResourceRequest<Parameters>, reporter: ResourceReporter): Promise<void> {
    const { accessKeyId, secretAccessKey, region, bucket } = request.parameters;

    const client = createClient(request.parameters);

    reporter.beginStep(`Creating bucket ${bucket}`);
    try {
      // us-east-1 must not be passed as a location constraint, every other region must.
      const createBucketConfiguration = region === 'us-east-1' ? undefined : { LocationConstraint: region as BucketLocationConstraint };

      await client.send(new CreateBucketCommand({ Bucket: bucket, CreateBucketConfiguration: createBucketConfiguration }));
      reporter.report('Bucket created successfully', { log: true });
    } catch (ex: unknown) {
      // The bucket already existing from a previous apply is the expected idempotent case.
      if (!(ex instanceof BucketAlreadyOwnedByYou)) {
        throw ex;
      } else {
        reporter.report('Bucket already exists', { log: true });
      }
    }

    reporter.appendContext({
      s3Region: region,
      s3Bucket: bucket,
      s3AccessKey: accessKeyId,
      s3SecretKey: secretAccessKey,
    });

    reporter.appendConnection({
      region: {
        value: region,
        label: 'Region',
        isPublic: true,
      },
      bucket: {
        value: bucket,
        label: 'Bucket',
        isPublic: true,
      },
      accessKey: {
        value: accessKeyId,
        label: 'Access Key',
        isPublic: false,
      },
      secretKey: {
        value: secretAccessKey,
        label: 'Secret Key',
        isPublic: false,
      },
    });
  }

  async delete(_: string, request: ResourceRequest<Parameters>) {
    const { bucket } = request.parameters;

    const client = createClient(request.parameters);
    try {
      await client.send(new DeleteBucketCommand({ Bucket: bucket }));
    } catch (ex: unknown) {
      if (!isNotFound(ex)) {
        throw ex;
      }
    }
  }

  async status(_: string, request: ResourceRequest<Parameters>): Promise<ResourceStatusResult> {
    const { bucket } = request.parameters;

    const client = createClient(request.parameters);

    let failure: string | undefined = undefined;
    try {
      await client.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch (ex: unknown) {
      failure = isNotFound(ex) ? 'Bucket not found' : `Bucket is not accessible: ${errorMessage(ex)}`;
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

function createClient(parameters: Parameters) {
  const { accessKeyId, secretAccessKey, region } = parameters;

  return new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
}

function isNotFound(ex: unknown): boolean {
  const status = (ex as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;

  return status === 404 || (ex as { name?: string })?.name === 'NotFound' || (ex as { name?: string })?.name === 'NoSuchBucket';
}

function errorMessage(ex: unknown): string {
  return ex instanceof Error ? ex.message : String(ex);
}
