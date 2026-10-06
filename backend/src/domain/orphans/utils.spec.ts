import { subHours } from 'date-fns';
import { describe, expect, it } from 'vitest';
import { CurrentDeploymentResources } from './interfaces';
import { isOrphanedResource } from './utils';

describe('isOrphanedResource', () => {
  const now = new Date('2026-08-21T12:00:00.000Z');
  const graceCutoff = subHours(now, 24);

  const buildDeployments = (updatedAt: Date, ...resourceIds: string[]) => {
    const entry: CurrentDeploymentResources = { resourceIds: new Set(resourceIds), updatedAt };

    return new Map<number, CurrentDeploymentResources>([[42, entry]]);
  };

  it('should not report resource when it belongs to a tracked deployment', () => {
    const deployments = buildDeployments(subHours(now, 48), 'vm');

    expect(isOrphanedResource('deployment_42_vm', deployments, graceCutoff)).toBe(false);
  });

  it('should report resource when the deployment is gone', () => {
    const deployments = buildDeployments(subHours(now, 48), 'vm');

    expect(isOrphanedResource('deployment_99_vm', deployments, graceCutoff)).toBe(true);
  });

  it('should report resource when it was dropped from the definition long ago', () => {
    const deployments = buildDeployments(subHours(now, 48), 'vm');

    expect(isOrphanedResource('deployment_42_storage', deployments, graceCutoff)).toBe(true);
  });

  it('should not report resource when the deployment changed within the grace period', () => {
    const deployments = buildDeployments(subHours(now, 1), 'vm');

    expect(isOrphanedResource('deployment_42_storage', deployments, graceCutoff)).toBe(false);
  });

  it('should not report resource when it was not created by pangostack', () => {
    const deployments = buildDeployments(subHours(now, 48), 'vm');

    expect(isOrphanedResource('my-own-server', deployments, graceCutoff)).toBe(false);
  });
});
