import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkerEntity, WorkerRepository } from 'src/domain/database';
import { WorkerClient } from '../client';
import { ResourceTypeDto } from '../generated';

@Injectable()
export class WorkerResolver {
  private readonly logger = new Logger(WorkerResolver.name);

  constructor(
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
  ) {}

  async clientForEndpoint(endpoint: string) {
    const worker = await this.workers.findOneBy({ endpoint });
    if (!worker) {
      throw new NotFoundException(`Worker ${endpoint} is not registered anymore.`);
    }

    return new WorkerClient(worker.endpoint, worker.apiKey);
  }

  async getWorkers(): Promise<Map<string, { client: WorkerClient; resourceType: ResourceTypeDto }>> {
    // The order decides which worker wins when several of them provide the same resource type.
    const entities = await this.workers.find({ order: { id: 'ASC' } });

    // A single unreachable worker should not delay the resolution of the other workers.
    const workerWithResourceTypes = await Promise.all(
      entities.map(async ({ apiKey, endpoint }) => {
        const client = new WorkerClient(endpoint, apiKey);

        try {
          const { items: resourceTypes } = await client.resources.getResources();
          return { client, resourceTypes };
        } catch (ex) {
          // An unreachable worker must not stop the resolution, its resource types are just not
          // available until it can be queried again.
          this.logger.warn(`Failed to get resource types from worker ${endpoint}.`, ex);

          return { client, resourceTypes: [] };
        }
      }),
    );

    const result = new Map<string, { client: WorkerClient; resourceType: ResourceTypeDto }>();
    for (const workerWithResourceType of workerWithResourceTypes) {
      for (const resourceType of workerWithResourceType.resourceTypes) {
        // The workers are ordered by ID, therefore the first worker that provides a resource type wins.
        if (!result.has(resourceType.name)) {
          result.set(resourceType.name, { client: workerWithResourceType.client, resourceType });
        }
      }
    }

    return result;
  }
}
