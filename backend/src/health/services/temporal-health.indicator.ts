import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { TemporalService } from 'src/domain/workflows/services';

const PING_TIMEOUT_MS = 5000;

@Injectable()
export class TemporalHealthIndicator {
  private readonly logger = new Logger(TemporalHealthIndicator.name);

  constructor(
    private readonly temporal: TemporalService,
    private readonly health: HealthIndicatorService,
  ) {}

  async pingTemporal(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.health.check(key);

    try {
      const [connection] = await this.temporal.getClient();

      // The connection is created once and then cached, therefore an actual request is needed. Without a
      // request inside the deadline scope a Temporal server that died after the startup is still up here.
      await connection.withDeadline(Date.now() + PING_TIMEOUT_MS, () => connection.workflowService.getSystemInfo({}));

      return indicator.up();
    } catch (ex) {
      this.logger.warn('Failed to ping temporal.', ex);

      return indicator.down();
    }
  }
}
