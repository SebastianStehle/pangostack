import { beforeAll, describe, expect, it } from 'vitest';
import { ServiceDto } from 'src/api/generated';
import { createAdminClients, getStatusCode } from 'src/shared/clients';
import { randomName } from 'src/shared/random';
import { scrub } from 'src/shared/scrub';
import { createService, createUser, readDefinition, TestUser } from 'src/shared/setup';

describe('services', () => {
  const admin = createAdminClients();

  let service: ServiceDto;
  let user: TestUser;

  beforeAll(async () => {
    ({ service } = await createService(admin, 'busybox.yaml'));
    user = await createUser(admin);
  });

  it('should create service with version when definition is valid', async () => {
    // STEP 1: Get versions of the created service.
    const versions = await admin.services.getServiceVersions(service.id);

    await expect(scrub({ service, versions }, [service.name])).toMatchFileSnapshot('./__snapshots__/service-created.snap');
  });

  it('should reject version when definition is invalid', async () => {
    // STEP 1: Create version without pricing model.
    const definition = 'parameters: []\nresources: []\n';

    const status = await getStatusCode(() =>
      admin.services.postServiceVersion(service.id, { name: '2.0.0', definition, environment: {}, isActive: true }),
    );
    expect(status).toBe(400);
  });

  it('should reject verification when resource type is unknown', async () => {
    // STEP 1: Verify definition with a resource type no worker provides.
    const definition = readDefinition('busybox.yaml').replace('type: docker-compose-ssh', 'type: unknown-resource');

    const status = await getStatusCode(() => admin.services.postVerifyServiceVersion(service.id, { definition, environment: {} }));
    expect(status).toBe(400);
  });

  it('should list service for end users when service is public', async () => {
    // STEP 1: Get public services as end user.
    const { items } = await user.clients.services.getServicesPublic();

    const publicService = items.find(({ id }) => id === service.id);
    expect(publicService?.parameters.map(({ name }) => name)).toEqual(['greeting']);
  });

  it('should forbid managing services when user is not admin', async () => {
    // STEP 1: Create service as end user.
    const status = await getStatusCode(() =>
      user.clients.services.postService({
        name: randomName('service'),
        description: 'Must not be created.',
        currency: 'EUR',
        environment: {},
        fixedPrice: 0,
        isPublic: true,
        pricePerCoreHour: 0,
        pricePerMemoryGBHour: 0,
        pricePerStorageGBMonth: 0,
        pricePerVolumeGBHour: 0,
      }),
    );
    expect(status).toBe(403);
  });
});
