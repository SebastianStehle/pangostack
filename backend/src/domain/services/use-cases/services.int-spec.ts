import { TypeOrmModule } from '@nestjs/typeorm';
import {
  createIntegrationTest,
  EMPTY_DEFINITION,
  IntegrationTestContext,
  seedService,
  seedServiceVersion,
  uniqueId,
} from 'test/integration/setup';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ServiceEntity, ServiceVersionEntity, WorkerEntity } from 'src/domain/database';
import { WorkerResolver } from 'src/domain/workers';
import {
  CreateService,
  CreateServiceHandler,
  CreateServiceResult,
  CreateServiceVersion,
  CreateServiceVersionHandler,
  CreateServiceVersionResult,
  DeleteService,
  DeleteServiceHandler,
  DeleteServiceVersion,
  DeleteServiceVersionHandler,
  GetServicePublicHandler,
  GetServicePublicQuery,
  GetServicePublicResult,
  GetServicesHandler,
  GetServicesPublicHandler,
  GetServicesPublicQuery,
  GetServicesPublicResult,
  GetServicesQuery,
  GetServicesResult,
  GetServiceVersionsHandler,
  GetServiceVersionsQuery,
  GetServiceVersionsResult,
  UpdateService,
  UpdateServiceHandler,
  UpdateServiceResult,
  UpdateServiceVersion,
  UpdateServiceVersionHandler,
  UpdateServiceVersionResult,
  VerifyDefinitionHandler,
  VerifyDefinitionQuery,
} from '.';

const MISSING_ID = 2147483000;

function serviceValues(overrides: Partial<CreateService['values']> = {}): CreateService['values'] {
  return {
    name: uniqueId('svc'),
    description: 'A test service.',
    environment: {},
    currency: 'USD',
    pricePerCoreHour: 0,
    pricePerMemoryGBHour: 0,
    pricePerStorageGBMonth: 0,
    pricePerVolumeGBHour: 0,
    fixedPrice: 0,
    isPublic: true,
    ...overrides,
  };
}

describe('services handlers', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await createIntegrationTest({
      imports: [TypeOrmModule.forFeature([ServiceEntity, ServiceVersionEntity, WorkerEntity])],
      providers: [
        CreateServiceHandler,
        UpdateServiceHandler,
        DeleteServiceHandler,
        GetServicesHandler,
        GetServicesPublicHandler,
        GetServicePublicHandler,
        CreateServiceVersionHandler,
        UpdateServiceVersionHandler,
        DeleteServiceVersionHandler,
        GetServiceVersionsHandler,
        VerifyDefinitionHandler,
        WorkerResolver,
      ],
    });
  });

  afterAll(async () => {
    await context.close();
  });

  describe('CreateService', () => {
    it('should create a service', async () => {
      const values = serviceValues();

      const { service } = await context.commandBus.execute<CreateService, CreateServiceResult>(new CreateService(values));

      expect(service.name).toBe(values.name);
      expect(service.description).toBe('A test service.');
      expect(service.isActive).toBe(false);
    });

    it('should persist prices and visibility', async () => {
      const values = serviceValues({ pricePerCoreHour: 5, isPublic: false });

      const { service } = await context.commandBus.execute<CreateService, CreateServiceResult>(new CreateService(values));

      expect(service.pricePerCoreHour).toBe(5);
      expect(service.isPublic).toBe(false);
    });
  });

  describe('UpdateService', () => {
    it('should update the service name', async () => {
      const service = await seedService(context.dataSource);
      const name = uniqueId('svc');

      const { service: updated } = await context.commandBus.execute<UpdateService, UpdateServiceResult>(
        new UpdateService(service.id, serviceValues({ name })),
      );

      expect(updated.name).toBe(name);
    });

    it('should throw when the service does not exist', async () => {
      await expect(
        context.commandBus.execute<UpdateService, UpdateServiceResult>(new UpdateService(MISSING_ID, serviceValues())),
      ).rejects.toThrow('not found');
    });
  });

  describe('DeleteService', () => {
    it('should delete the service', async () => {
      const service = await seedService(context.dataSource);

      await context.commandBus.execute(new DeleteService(service.id));

      expect(await context.dataSource.getRepository(ServiceEntity).findOneBy({ id: service.id })).toBeNull();
    });

    it('should throw when the service does not exist', async () => {
      await expect(context.commandBus.execute(new DeleteService(MISSING_ID))).rejects.toThrow('not found');
    });
  });

  describe('GetServicesQuery', () => {
    it('should return a seeded service among the results', async () => {
      const service = await seedService(context.dataSource);

      const { services } = await context.queryBus.execute<GetServicesQuery, GetServicesResult>(new GetServicesQuery());

      expect(services.map((entry) => entry.id)).toContain(service.id);
    });

    it('should mark a service with an active version as active', async () => {
      const service = await seedService(context.dataSource);
      await seedServiceVersion(context.dataSource, service.id, { isActive: true });

      const { services } = await context.queryBus.execute<GetServicesQuery, GetServicesResult>(new GetServicesQuery());

      expect(services.find((entry) => entry.id === service.id)?.isActive).toBe(true);
    });
  });

  describe('GetServicesPublicQuery', () => {
    it('should only return public services', async () => {
      const publicService = await seedService(context.dataSource, { isPublic: true });
      const privateService = await seedService(context.dataSource, { isPublic: false });

      const { services } = await context.queryBus.execute<GetServicesPublicQuery, GetServicesPublicResult>(
        new GetServicesPublicQuery(true),
      );

      const ids = services.map((entry) => entry.id);
      expect(ids).toContain(publicService.id);
      expect(ids).not.toContain(privateService.id);
    });

    it('should include private services when publicOnly is false', async () => {
      const privateService = await seedService(context.dataSource, { isPublic: false });

      const { services } = await context.queryBus.execute<GetServicesPublicQuery, GetServicesPublicResult>(
        new GetServicesPublicQuery(false),
      );

      expect(services.map((entry) => entry.id)).toContain(privateService.id);
    });
  });

  describe('GetServicePublicQuery', () => {
    it('should return the public service with its active version', async () => {
      const service = await seedService(context.dataSource, { isPublic: true });
      const version = await seedServiceVersion(context.dataSource, service.id, { isActive: true });

      const { service: result } = await context.queryBus.execute<GetServicePublicQuery, GetServicePublicResult>(
        new GetServicePublicQuery(service.id),
      );

      expect(result?.id).toBe(service.id);
      expect(result?.version).toBe(version.name);
    });

    it('should not return a private service to the public query', async () => {
      const service = await seedService(context.dataSource, { isPublic: false });
      await seedServiceVersion(context.dataSource, service.id, { isActive: true });

      const { service: result } = await context.queryBus.execute<GetServicePublicQuery, GetServicePublicResult>(
        new GetServicePublicQuery(service.id),
      );

      expect(result).toBeFalsy();
    });
  });

  describe('CreateServiceVersion', () => {
    it('should create a version for a service', async () => {
      const service = await seedService(context.dataSource);
      const name = uniqueId('v');

      const { serviceVersion } = await context.commandBus.execute<CreateServiceVersion, CreateServiceVersionResult>(
        new CreateServiceVersion(service.id, {
          name,
          definition: EMPTY_DEFINITION,
          environment: {},
          isActive: true,
          definitionSource: null,
        }),
      );

      expect(serviceVersion.name).toBe(name);
    });

    it('should throw when the service does not exist', async () => {
      await expect(
        context.commandBus.execute<CreateServiceVersion, CreateServiceVersionResult>(
          new CreateServiceVersion(MISSING_ID, {
            name: uniqueId('v'),
            definition: EMPTY_DEFINITION,
            environment: {},
            isActive: true,
            definitionSource: null,
          }),
        ),
      ).rejects.toThrow('not found');
    });
  });

  describe('UpdateServiceVersion', () => {
    it('should deactivate a version', async () => {
      const service = await seedService(context.dataSource);
      const version = await seedServiceVersion(context.dataSource, service.id, { isActive: true });

      const { serviceVersion } = await context.commandBus.execute<UpdateServiceVersion, UpdateServiceVersionResult>(
        new UpdateServiceVersion(version.id, { isActive: false }),
      );

      expect(serviceVersion.isActive).toBe(false);
    });

    it('should throw when the version does not exist', async () => {
      await expect(
        context.commandBus.execute<UpdateServiceVersion, UpdateServiceVersionResult>(
          new UpdateServiceVersion(MISSING_ID, { isActive: false }),
        ),
      ).rejects.toThrow('not found');
    });
  });

  describe('DeleteServiceVersion', () => {
    it('should delete a version', async () => {
      const service = await seedService(context.dataSource);
      const version = await seedServiceVersion(context.dataSource, service.id);

      await context.commandBus.execute(new DeleteServiceVersion(version.id));

      expect(await context.dataSource.getRepository(ServiceVersionEntity).findOneBy({ id: version.id })).toBeNull();
    });

    it('should throw when the version does not exist', async () => {
      await expect(context.commandBus.execute(new DeleteServiceVersion(MISSING_ID))).rejects.toThrow('not found');
    });
  });

  describe('GetServiceVersionsQuery', () => {
    it('should return all versions of a service', async () => {
      const service = await seedService(context.dataSource);
      await seedServiceVersion(context.dataSource, service.id);
      await seedServiceVersion(context.dataSource, service.id);

      const { serviceVersions } = await context.queryBus.execute<GetServiceVersionsQuery, GetServiceVersionsResult>(
        new GetServiceVersionsQuery(service.id),
      );

      expect(serviceVersions).toHaveLength(2);
    });

    it('should mark the active version as default', async () => {
      const service = await seedService(context.dataSource);
      await seedServiceVersion(context.dataSource, service.id, { isActive: true });

      const { serviceVersions } = await context.queryBus.execute<GetServiceVersionsQuery, GetServiceVersionsResult>(
        new GetServiceVersionsQuery(service.id),
      );

      expect(serviceVersions[0].isDefault).toBe(true);
    });
  });

  describe('VerifyDefinitionQuery', () => {
    it('should fail when no worker is available', async () => {
      const service = await seedService(context.dataSource);

      await expect(
        context.queryBus.execute<VerifyDefinitionQuery, void>(new VerifyDefinitionQuery(service.id, EMPTY_DEFINITION, {})),
      ).rejects.toThrow('No worker available.');
    });

    it('should fail when the service does not exist', async () => {
      await expect(
        context.queryBus.execute<VerifyDefinitionQuery, void>(new VerifyDefinitionQuery(MISSING_ID, EMPTY_DEFINITION, {})),
      ).rejects.toThrow('not found');
    });
  });
});
