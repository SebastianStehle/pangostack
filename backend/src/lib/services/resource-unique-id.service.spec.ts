import { ConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';
import { InstallConfig } from '../config';
import { ResourceUniqueIdService } from './resource-unique-id.service';

function createService(install: InstallConfig) {
  return new ResourceUniqueIdService({ get: () => install } as unknown as ConfigService);
}

describe('ResourceUniqueIdService', () => {
  it('should keep the original scheme when no install id is set', () => {
    const service = createService({});

    expect(service.build(42, 'my_vm')).toBe('deployment_42_my_vm');
    expect(service.parse('deployment_42_my_vm')).toEqual({ deploymentId: 42, resourceId: 'my_vm' });
  });

  it('should prefix the install id when it is set', () => {
    const service = createService({ installId: 'blue' });

    expect(service.build(42, 'my_vm')).toBe('blue_deployment_42_my_vm');
    expect(service.parse('blue_deployment_42_my_vm')).toEqual({ deploymentId: 42, resourceId: 'my_vm' });
  });

  it('should not parse ids that are malformed', () => {
    const service = createService({});

    expect(service.parse('deployment_abc_vm')).toBeNull();
    expect(service.parse('deployment_42_')).toBeNull();
    expect(service.parse('deployment__vm')).toBeNull();
  });
});
