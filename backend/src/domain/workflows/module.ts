import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BilledDeploymentEntity,
  DeploymentCheckEntity,
  DeploymentEntity,
  DeploymentUpdateEntity,
  DeploymentUsageEntity,
  WorkerEntity,
} from 'src/domain/database';
import { BillingModule } from '../billing';
import { NotificationModule } from '../notifications';
import {
  ChargeDeploymentActivity,
  CleanupDeploymentsChecksActivity,
  CleanupDeploymentUsagesActivity,
  CleanupFailedDeployments,
  DeleteDeploymentActivity,
  DeleteResourceActivity,
  DeployResourceActivity,
  GetDeploymentsActivity,
  GetWorkerActivity,
  NotifyActivity,
  TrackDeploymentHealthActivity,
  TrackDeploymentUsageActivity,
  UpdateDeploymentActivity,
} from './activities';
import { ActivityExplorerService } from './registration';
import { TemporalService, WorkflowService } from './services';

@Module({
  imports: [
    BillingModule,
    ConfigModule,
    NotificationModule,
    TypeOrmModule.forFeature([
      BilledDeploymentEntity,
      DeploymentEntity,
      DeploymentCheckEntity,
      DeploymentUpdateEntity,
      DeploymentUsageEntity,
      WorkerEntity,
    ]),
  ],
  providers: [
    ActivityExplorerService,
    ChargeDeploymentActivity,
    CleanupDeploymentsChecksActivity,
    CleanupDeploymentUsagesActivity,
    CleanupFailedDeployments,
    DeleteDeploymentActivity,
    DeleteResourceActivity,
    DeployResourceActivity,
    GetDeploymentsActivity,
    GetWorkerActivity,
    NotifyActivity,
    TemporalService,
    TrackDeploymentHealthActivity,
    TrackDeploymentUsageActivity,
    UpdateDeploymentActivity,
    WorkflowService,
  ],
  exports: [TemporalService, WorkflowService],
})
export class WorkflowModule {}
