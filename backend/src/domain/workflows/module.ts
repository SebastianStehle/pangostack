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
  DeploymentUpdateSubStepEntity,
  DeploymentUsageEntity,
  OrphanedResourceEntity,
  ServiceVersionEntity,
  WorkerEntity,
} from 'src/domain/database';
import { LibModule } from 'src/lib';
import { BillingModule } from '../billing';
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
  GetDeploymentsActivity,
  GetOrphanScanGroupsActivity,
  GetResourceWorkersActivity,
  ReportBillingFailuresActivity,
  ScanOrphanGroupActivity,
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
    TypeOrmModule.forFeature([
      BilledDeploymentEntity,
      DeploymentEntity,
      DeploymentCheckEntity,
      DeploymentMetricEntity,
      DeploymentUpdateEntity,
      DeploymentUpdateStepEntity,
      DeploymentUpdateSubStepEntity,
      DeploymentUsageEntity,
      OrphanedResourceEntity,
      ServiceVersionEntity,
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
    GetDeploymentsActivity,
    GetOrphanScanGroupsActivity,
    GetResourceWorkersActivity,
    ReportBillingFailuresActivity,
    ScanOrphanGroupActivity,
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
