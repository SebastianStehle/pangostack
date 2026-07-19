import { describe, expect, it } from 'vitest';
import { ServiceEntity, ServiceVersionEntity } from 'src/domain/database';
import { buildService, buildServiceVersion } from './utils';

function version(overrides: Partial<ServiceVersionEntity>): ServiceVersionEntity {
  return { deploymentUpdates: [], ...overrides } as unknown as ServiceVersionEntity;
}

describe('buildService', () => {
  it('should mark the service active and pick the latest version by creation date', () => {
    const service = {
      id: 1,
      currency: 'USD',
      description: 'desc',
      environment: {},
      fixedPrice: 0,
      isPublic: true,
      name: 'svc',
      pricePerCoreHour: 0,
      pricePerVolumeGBHour: 0,
      pricePerMemoryGBHour: 0,
      pricePerStorageGBMonth: 0,
      versions: [
        version({
          isActive: false,
          name: 'v1',
          createdAt: new Date('2026-01-01'),
          deploymentUpdates: [{ deploymentId: 1 }] as never,
        }),
        version({
          isActive: true,
          name: 'v2',
          createdAt: new Date('2026-02-01'),
          deploymentUpdates: [{ deploymentId: 2 }] as never,
        }),
      ],
    } as unknown as ServiceEntity;

    const result = buildService(service);

    expect(result.isActive).toBe(true);
    expect(result.latestVersion).toBe('v2');
  });

  it('should count distinct deployments across versions', () => {
    const service = {
      versions: [
        version({ createdAt: new Date('2026-01-01'), deploymentUpdates: [{ deploymentId: 1 }, { deploymentId: 1 }] as never }),
        version({ createdAt: new Date('2026-02-01'), deploymentUpdates: [{ deploymentId: 2 }] as never }),
      ],
    } as unknown as ServiceEntity;

    expect(buildService(service).numDeployments).toBe(2);
  });
});

describe('buildServiceVersion', () => {
  it('should count distinct deployments and expose the default flag', () => {
    const source = version({
      id: 1,
      name: 'v1',
      deploymentUpdates: [{ deploymentId: 5 }, { deploymentId: 5 }, { deploymentId: 6 }] as never,
    });

    const result = buildServiceVersion(source, true);

    expect(result.numDeployments).toBe(2);
    expect(result.isDefault).toBe(true);
  });
});
