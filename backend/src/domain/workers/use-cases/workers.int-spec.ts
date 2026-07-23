import { TypeOrmModule } from '@nestjs/typeorm';
import { createIntegrationTest, IntegrationTestContext, seedWorker } from 'test/integration/setup';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WorkerEntity } from 'src/domain/database';
import { CreateWorker, CreateWorkerHandler, CreateWorkerResult } from './create-worker';
import { DeleteWorker, DeleteWorkerHandler } from './delete-worker';
import { GetResourceTypesHandler, GetResourceTypesQuery, GetResourceTypesResult } from './get-resource-types';
import { GetWorkersHandler, GetWorkersQuery, GetWorkersResult } from './get-workers';
import { UpdateWorker, UpdateWorkerHandler, UpdateWorkerResult } from './update-worker';

// These handlers fan out to each worker over HTTP via a WorkerClient constructed inside the handler,
// which cannot be injected/mocked here. The tests cover the database path and the unreachable-worker
// branch (the worker endpoints point at a closed port); the happy HTTP path needs a real worker.
describe('workers handlers', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await createIntegrationTest({
      imports: [TypeOrmModule.forFeature([WorkerEntity])],
      providers: [CreateWorkerHandler, DeleteWorkerHandler, GetWorkersHandler, GetResourceTypesHandler, UpdateWorkerHandler],
    });
  });

  afterAll(async () => {
    await context.close();
  });

  describe('GetWorkersQuery', () => {
    it('should return no workers when none are registered', async () => {
      await context.dataSource.getRepository(WorkerEntity).clear();

      const { workers } = await context.queryBus.execute<GetWorkersQuery, GetWorkersResult>(new GetWorkersQuery());

      expect(workers).toEqual([]);
    });

    it('should return a registered worker even when it is unreachable', async () => {
      await context.dataSource.getRepository(WorkerEntity).clear();
      await seedWorker(context.dataSource);

      const { workers } = await context.queryBus.execute<GetWorkersQuery, GetWorkersResult>(new GetWorkersQuery());

      expect(workers).toHaveLength(1);
    });
  });

  describe('CreateWorker', () => {
    it('should create a worker when values are provided', async () => {
      await context.dataSource.getRepository(WorkerEntity).clear();

      const { worker } = await context.commandBus.execute<CreateWorker, CreateWorkerResult>(
        new CreateWorker({ endpoint: 'http://localhost:9999', apiKey: 'my-key' }),
      );

      expect(worker).toEqual({ id: expect.any(Number), endpoint: 'http://localhost:9999', hasApiKey: true });
    });
  });

  describe('UpdateWorker', () => {
    it('should keep the api key when it is not provided', async () => {
      await context.dataSource.getRepository(WorkerEntity).clear();
      const created = await seedWorker(context.dataSource, { apiKey: 'my-key' });

      const { worker } = await context.commandBus.execute<UpdateWorker, UpdateWorkerResult>(
        new UpdateWorker(created.id, { endpoint: 'http://localhost:8888' }),
      );

      expect(worker).toEqual({ id: created.id, endpoint: 'http://localhost:8888', hasApiKey: true });
    });
  });

  describe('DeleteWorker', () => {
    it('should delete a worker when it exists', async () => {
      await context.dataSource.getRepository(WorkerEntity).clear();
      const created = await seedWorker(context.dataSource);

      await context.commandBus.execute(new DeleteWorker(created.id));

      expect(await context.dataSource.getRepository(WorkerEntity).countBy({ id: created.id })).toEqual(0);
    });
  });

  describe('GetResourceTypesQuery', () => {
    it('should return no resource types when no workers are registered', async () => {
      await context.dataSource.getRepository(WorkerEntity).clear();

      const { resourceTypes } = await context.queryBus.execute<GetResourceTypesQuery, GetResourceTypesResult>(
        new GetResourceTypesQuery(),
      );

      expect(resourceTypes).toEqual([]);
    });

    it('should skip unreachable workers and return no resource types', async () => {
      await context.dataSource.getRepository(WorkerEntity).clear();
      await seedWorker(context.dataSource);

      const { resourceTypes } = await context.queryBus.execute<GetResourceTypesQuery, GetResourceTypesResult>(
        new GetResourceTypesQuery(),
      );

      expect(resourceTypes).toEqual([]);
    });
  });
});
