import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { WorkflowModule } from 'src/domain/workflows';
import { TemporalHealthIndicator } from './services/temporal-health.indicator';

@Module({
  imports: [TerminusModule, WorkflowModule],
  providers: [TemporalHealthIndicator],
  exports: [TemporalHealthIndicator],
})
export class HealthModule {}
