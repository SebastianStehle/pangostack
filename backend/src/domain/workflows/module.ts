import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BilledDeploymentEntity,
  DeploymentEntity,
  DeploymentUpdateEntity,
  DeploymentUsageEntity,
  WorkerEntity,
} from 'src/domain/database';
import { BillingModule } from '../billing';
import {
  ChargeDeploymentActivity,
  CreateSubscriptionActivity,
  DeleteResourceActivity,
  DeployResourceActivity,
  GetDeploymentsActivity,
  GetWorkerActivity,
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
      DeploymentUpdateEntity,
      DeploymentUsageEntity,
      WorkerEntity,
    ]),
  ],
  providers: [
    ActivityExplorerService,
    ChargeDeploymentActivity,
    CreateSubscriptionActivity,
    DeleteResourceActivity,
    DeployResourceActivity,
    GetDeploymentsActivity,
    GetWorkerActivity,
    TemporalService,
    TrackDeploymentUsageActivity,
    UpdateDeploymentActivity,
    WorkflowService,
  ],
  exports: [WorkflowService],
})
export class WorkflowModule {}
