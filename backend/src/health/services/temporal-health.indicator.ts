import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { TemporalService } from 'src/domain/workflows/services';

@Injectable()
export class TemporalHealthIndicator {
  constructor(
    private readonly temporal: TemporalService,
    private readonly health: HealthIndicatorService,
  ) {}

  async pingTemporal(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.health.check(key);

    try {
      const [, client] = await this.temporal.getClient();

      await client.connection.withDeadline(Date.now() + 5000, async () => {
        // Ping Temporal
      });

      return indicator.up();
    } catch {
      return indicator.down();
    }
  }
}
