import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeploymentUpdateEntity } from 'src/domain/database';
import { BillingModule } from '../billing';
import {
  CreateSubscriptionActivity,
  DeleteResourceActivity,
  DeployResourceActivity,
  GetDeploymentsActivity,
  GetWorkerActivity,
  TrackDeploymentActivity,
  UpdateDeploymentActivity,
} from './activities';
import { ActivityExplorerService } from './registration';
import { TemporalService, WorkflowService } from './services';

@Module({
  imports: [BillingModule, TypeOrmModule.forFeature([DeploymentUpdateEntity])],
  providers: [
    ActivityExplorerService,
    CreateSubscriptionActivity,
    DeleteResourceActivity,
    DeployResourceActivity,
    GetDeploymentsActivity,
    GetWorkerActivity,
    TemporalService,
    TrackDeploymentActivity,
    UpdateDeploymentActivity,
    WorkflowService,
  ],
  exports: [WorkflowService],
})
export class WorkflowModule {}
