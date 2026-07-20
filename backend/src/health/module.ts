import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TerminusModule } from '@nestjs/terminus';
import { WorkflowModule } from 'src/domain/workflows';
import { TemporalHealthIndicator } from './services/temporal-health.indicator';
import { WorkerHealthIndicator } from './services/worker-health.indicator';

@Module({
  imports: [CqrsModule, TerminusModule, WorkflowModule],
  providers: [TemporalHealthIndicator, WorkerHealthIndicator],
  exports: [TemporalHealthIndicator, WorkerHealthIndicator],
})
export class HealthModule {}
