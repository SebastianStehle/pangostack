import { Module } from '@nestjs/common';
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
import {
  ChargeDeploymentActivity,
  CleanupDeploymentsChecksActivity,
  CleanupDeploymentUsagesActivity,
  DeleteResourceActivity,
  DeployResourceActivity,
  GetDeploymentsActivity,
  GetWorkerActivity,
  TrackDeploymentHealthActivity,
  TrackDeploymentUsageActivity,
  UpdateDeploymentActivity,
} from './activities';
import { ActivityExplorerService } from './registration';
import { TemporalService, WorkflowService } from './services';

@Module({
  imports: [
    BillingModule,
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
    DeleteResourceActivity,
    DeployResourceActivity,
    GetDeploymentsActivity,
    GetWorkerActivity,
    TemporalService,
    TrackDeploymentHealthActivity,
    TrackDeploymentUsageActivity,
    UpdateDeploymentActivity,
    WorkflowService,
  ],
  exports: [WorkflowService],
})
export class WorkflowModule {}
