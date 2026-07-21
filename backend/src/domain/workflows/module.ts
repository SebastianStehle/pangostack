import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BilledDeploymentEntity,
  DeploymentCheckEntity,
  DeploymentEntity,
  DeploymentMetricEntity,
  DeploymentUpdateEntity,
  DeploymentUpdateStepEntity,
  DeploymentUsageEntity,
  WorkerEntity,
} from 'src/domain/database';
import { LibModule } from 'src/lib';
import { BillingModule } from '../billing';
import { NotificationModule } from '../notifications';
import { WorkersModule } from '../workers';
import {
  ChargeDeploymentActivity,
  CleanupDeploymentMetricsActivity,
  CleanupDeploymentsChecksActivity,
  CleanupDeploymentUsagesActivity,
  CleanupFailedDeployments,
  CreateDeploymentStepsActivity,
  DeleteDeploymentActivity,
  DeleteResourceActivity,
  DeployResourceActivity,
  FailDeploymentStepActivity,
  GetDeploymentActivity,
  GetDeploymentsActivity,
  GetResourceWorkersActivity,
  NotifyActivity,
  TrackDeploymentHealthActivity,
  TrackDeploymentMetricsActivity,
  TrackDeploymentUsageActivity,
  UpdateDeploymentActivity,
} from './activities';
import { ActivityExplorerService } from './registration';
import { TemporalService, WorkflowService } from './services';

@Module({
  imports: [
    BillingModule,
    ConfigModule,
    LibModule,
    NotificationModule,
    TypeOrmModule.forFeature([
      BilledDeploymentEntity,
      DeploymentEntity,
      DeploymentCheckEntity,
      DeploymentMetricEntity,
      DeploymentUpdateEntity,
      DeploymentUpdateStepEntity,
      DeploymentUsageEntity,
      WorkerEntity,
    ]),
    WorkersModule,
  ],
  providers: [
    ActivityExplorerService,
    ChargeDeploymentActivity,
    CleanupDeploymentMetricsActivity,
    CleanupDeploymentsChecksActivity,
    CleanupDeploymentUsagesActivity,
    CleanupFailedDeployments,
    CreateDeploymentStepsActivity,
    DeleteDeploymentActivity,
    DeleteResourceActivity,
    DeployResourceActivity,
    FailDeploymentStepActivity,
    GetDeploymentActivity,
    GetDeploymentsActivity,
    GetResourceWorkersActivity,
    NotifyActivity,
    TemporalService,
    TrackDeploymentHealthActivity,
    TrackDeploymentMetricsActivity,
    TrackDeploymentUsageActivity,
    UpdateDeploymentActivity,
    WorkflowService,
  ],
  exports: [TemporalService, WorkflowService],
})
export class WorkflowModule {}
