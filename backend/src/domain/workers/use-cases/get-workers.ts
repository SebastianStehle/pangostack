import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkerEntity, WorkerRepository } from 'src/domain/database';
import { WorkerClient } from '../client';
import { Worker } from '../interfaces';
import { buildWorker } from './utils';

export class GetWorkersQuery extends Query<GetWorkersResult> {}

export class GetWorkersResult {
  constructor(public readonly workers: Worker[]) {}
}

@QueryHandler(GetWorkersQuery)
export class GetWorkersHandler implements IQueryHandler<GetWorkersQuery, GetWorkersResult> {
  constructor(
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
  ) {}

  async execute(): Promise<GetWorkersResult> {
    const entities = await this.workers.find();

    const result: Worker[] = [];
    for (const entity of entities) {
      const client = new WorkerClient(entity.endpoint, entity.apiKey);

      let isReady = true;
      try {
        await client.resources.getResources();
      } catch {
        isReady = false;
      }

      result.push(buildWorker(entity, isReady));
    }

    return new GetWorkersResult(result);
  }
}
