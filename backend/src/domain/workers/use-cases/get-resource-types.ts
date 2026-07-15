import { Logger } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkerEntity, WorkerRepository } from 'src/domain/database';
import { WorkerClient } from '../client';
import { ResourceTypeDto } from '../generated';

export class GetResourceTypesQuery extends Query<GetResourceTypesResult> {}

export class GetResourceTypesResult {
  constructor(public readonly resourceTypes: ResourceTypeDto[]) {}
}

@QueryHandler(GetResourceTypesQuery)
export class GetResourceTypesHandler implements IQueryHandler<GetResourceTypesQuery, GetResourceTypesResult> {
  private readonly logger = new Logger(GetResourceTypesHandler.name);

  constructor(
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
  ) {}

  async execute(): Promise<GetResourceTypesResult> {
    const entities = await this.workers.find();

    // Different workers can provide the same resource type, therefore merge them by name.
    const resourceTypes = new Map<string, ResourceTypeDto>();
    for (const entity of entities) {
      const client = new WorkerClient(entity.endpoint, entity.apiKey);

      try {
        const resources = await client.resources.getResources();

        for (const item of resources.items) {
          resourceTypes.set(item.name, item);
        }
      } catch (ex) {
        this.logger.warn(`Failed to get resources from worker ${entity.endpoint}.`, ex);
      }
    }

    return new GetResourceTypesResult([...resourceTypes.values()]);
  }
}
