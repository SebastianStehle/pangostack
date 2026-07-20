import { TypeOrmModule } from '@nestjs/typeorm';
import { createIntegrationTest, IntegrationTestContext, seedWorker } from 'test/integration/setup';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WorkerEntity } from 'src/domain/database';
import { GetResourceTypesHandler, GetResourceTypesQuery, GetResourceTypesResult } from './get-resource-types';
import { GetWorkersHandler, GetWorkersQuery, GetWorkersResult } from './get-workers';

// These handlers fan out to each worker over HTTP via a WorkerClient constructed inside the handler,
// which cannot be injected/mocked here. The tests cover the database path and the unreachable-worker
// branch (the worker endpoints point at a closed port); the happy HTTP path needs a real worker.
describe('workers handlers', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await createIntegrationTest({
      imports: [TypeOrmModule.forFeature([WorkerEntity])],
      providers: [GetWorkersHandler, GetResourceTypesHandler],
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
