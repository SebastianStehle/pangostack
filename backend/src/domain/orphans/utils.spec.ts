import { ConfigService } from '@nestjs/config';
import { subHours } from 'date-fns';
import { beforeAll, describe, expect, it } from 'vitest';
import { InstallConfig, ResourceUniqueIdService } from 'src/lib';
import { CurrentDeploymentResources } from './interfaces';
import { isOrphanedResource } from './utils';

function createIds(install: InstallConfig) {
  return new ResourceUniqueIdService({ get: () => install } as unknown as ConfigService);
}

describe('isOrphanedResource', () => {
  const now = new Date('2026-08-21T12:00:00.000Z');
  const graceCutoff = subHours(now, 24);

  let ids: ResourceUniqueIdService;
  let scopedIds: ResourceUniqueIdService;

  beforeAll(() => {
    ids = createIds({});
    scopedIds = createIds({ installId: 'blue' });
  });

  const buildDeployments = (updatedAt: Date, ...resourceIds: string[]) => {
    const entry: CurrentDeploymentResources = { resourceIds: new Set(resourceIds), updatedAt };

    return new Map<number, CurrentDeploymentResources>([[42, entry]]);
  };

  const check = (resourceUniqueId: string, deployments: Map<number, CurrentDeploymentResources>, source = ids) => {
    return isOrphanedResource(source.parse(resourceUniqueId), deployments, graceCutoff);
  };

  it('should not report resource when it belongs to a tracked deployment', () => {
    const deployments = buildDeployments(subHours(now, 48), 'vm');

    expect(check('deployment_42_vm', deployments)).toBe(false);
  });

  it('should report resource when the deployment is gone', () => {
    const deployments = buildDeployments(subHours(now, 48), 'vm');

    expect(check('deployment_99_vm', deployments)).toBe(true);
  });

  it('should report resource when it was dropped from the definition long ago', () => {
    const deployments = buildDeployments(subHours(now, 48), 'vm');

    expect(check('deployment_42_storage', deployments)).toBe(true);
  });

  it('should not report resource when the deployment changed within the grace period', () => {
    const deployments = buildDeployments(subHours(now, 1), 'vm');

    expect(check('deployment_42_storage', deployments)).toBe(false);
  });

  it('should not report resource when it was not created by pangostack', () => {
    const deployments = buildDeployments(subHours(now, 48), 'vm');

    expect(check('my-own-server', deployments)).toBe(false);
  });

  it('should only report resources of its own install when an install id is set', () => {
    const deployments = buildDeployments(subHours(now, 48), 'vm');

    expect(check('blue_deployment_99_vm', deployments, scopedIds)).toBe(true);
    expect(check('green_deployment_99_vm', deployments, scopedIds)).toBe(false);
    expect(check('deployment_99_vm', deployments, scopedIds)).toBe(false);
    expect(check('blue_deployment_99_vm', deployments, ids)).toBe(false);
  });
});
