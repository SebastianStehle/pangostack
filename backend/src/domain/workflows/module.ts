import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeploymentUpdateEntity } from 'src/domain/database';
import { BillingModule } from '../billing';
import {
  CreateSubscriptionActivity,
  DeleteResourceActivity,
  DeployResourceActivity,
  UpdateDeploymentActivity,
} from './activities';
import { TemporalService, WorkflowService } from './services';

@Module({
  imports: [BillingModule, TypeOrmModule.forFeature([DeploymentUpdateEntity])],
  providers: [
    CreateSubscriptionActivity,
    DeleteResourceActivity,
    DeployResourceActivity,
    TemporalService,
    UpdateDeploymentActivity,
    WorkflowService,
  ],
  exports: [WorkflowService],
})
export class WorkflowModule {}
