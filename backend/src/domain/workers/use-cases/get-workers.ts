import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkerEntity, WorkerRepository } from 'src/domain/database';
import { WorkerWithStatus } from '../interfaces';
import { buildWorker, pingWorker } from './utils';

export class GetWorkersQuery extends Query<GetWorkersResult> {}

export class GetWorkersResult {
  constructor(public readonly workers: WorkerWithStatus[]) {}
}

@QueryHandler(GetWorkersQuery)
export class GetWorkersHandler implements IQueryHandler<GetWorkersQuery, GetWorkersResult> {
  constructor(
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
  ) {}

  async execute(): Promise<GetWorkersResult> {
    const entities = await this.workers.find({ order: { id: 'ASC' } });

    // A single unreachable worker should not delay the status of the other workers.
    const workers = await Promise.all(
      entities.map(async (entity) => ({ ...buildWorker(entity), status: await pingWorker(entity) })),
    );

    return new GetWorkersResult(workers);
  }
}
