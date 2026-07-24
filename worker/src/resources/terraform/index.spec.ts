import { beforeEach, describe, expect, it } from 'vitest';
import { ResourceRequest } from '../interface';
import { TerraformResource } from './index';

const RESOURCE_ID = 'my-stack';

function encodeState(state: unknown): string {
  return Buffer.from(JSON.stringify(state)).toString('base64');
}

function createRequest(state?: string): ResourceRequest<any, any> {
  return {
    parameters: { config: 'resource "null_resource" "test" {}' },
    resourceContext: state ? { state } : {},
    timeoutMs: 1000,
  };
}

describe('TerraformResource', () => {
  let resource: TerraformResource;

  beforeEach(() => {
    resource = new TerraformResource();
  });

  it('should report ready with a node per managed resource when state exists', async () => {
    const state = encodeState({
      resources: [
        { mode: 'managed', type: 'aws_s3_bucket', name: 'data', instances: [{}] },
        { mode: 'data', type: 'aws_ami', name: 'ubuntu', instances: [{}] },
      ],
    });

    const status = await resource.status(RESOURCE_ID, createRequest(state));

    expect(status.workloads[0].nodes).toEqual([{ name: 'aws_s3_bucket.data', isReady: true }]);
  });

  it('should report not ready when no state has been stored yet', async () => {
    const status = await resource.status(RESOURCE_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'State', isReady: false, message: 'Configuration has not been applied yet' }]);
  });
});
