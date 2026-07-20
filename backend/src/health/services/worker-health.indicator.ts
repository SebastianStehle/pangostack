import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { GetWorkersQuery, GetWorkersResult } from 'src/domain/workers';

@Injectable()
export class WorkerHealthIndicator {
  private readonly logger = new Logger(WorkerHealthIndicator.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly health: HealthIndicatorService,
  ) {}

  async pingWorkers(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.health.check(key);

    try {
      const { workers } = await this.queryBus.execute<GetWorkersQuery, GetWorkersResult>(new GetWorkersQuery());

      const details = { total: workers.length, ready: workers.filter(({ status }) => status.isReady).length };

      // A single broken worker should not take the backend out of rotation, but without any reachable
      // worker no resource can be provisioned anymore.
      if (details.ready === 0) {
        this.logger.warn(`No reachable worker found out of ${workers.length} configured workers.`);

        return indicator.down(details);
      }

      return indicator.up(details);
    } catch (ex) {
      this.logger.warn('Failed to get the worker status.', ex);

      return indicator.down();
    }
  }
}
