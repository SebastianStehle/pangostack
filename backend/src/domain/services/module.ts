import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentUpdateEntity, ServiceEntity, ServiceVersionEntity, WorkerEntity } from 'src/domain/database';
import { BillingModule } from '../billing';
import { TemporalService } from './services';
import {
  CreateDeploymentHandler,
  CreateServiceHandler,
  CreateServiceVersionHandler,
  DeleteDeploymentHandler,
  DeleteServiceHandler,
  DeleteServiceVersionHandler,
  GetDeploymentStatusHandler,
  GetServicesHandler,
  GetServicesPublicHandler,
  GetServiceVersionsHandler,
  GetTeamDeploymentsHandler,
  UpdateDeploymentHandler,
  UpdateServiceHandler,
  UpdateServiceVersionHandler,
} from './use-cases';
import {
  CreateSubscriptionActivity,
  DeleteResourceActivity,
  DeployResourceActivity,
  UpdateDeploymentActivity,
} from './workflows/activities';
import { WorkflowRunner } from './workflows/runner';

@Module({
  imports: [
    BillingModule,
    TypeOrmModule.forFeature([ServiceEntity, ServiceVersionEntity, DeploymentUpdateEntity, DeploymentEntity, WorkerEntity]),
  ],
  providers: [
    CreateSubscriptionActivity,
    CreateDeploymentHandler,
    CreateServiceHandler,
    CreateServiceVersionHandler,
    DeleteDeploymentHandler,
    DeleteResourceActivity,
    DeleteServiceHandler,
    DeleteServiceVersionHandler,
    DeployResourceActivity,
    GetDeploymentStatusHandler,
    GetTeamDeploymentsHandler,
    GetServicesHandler,
    GetServicesPublicHandler,
    GetServiceVersionsHandler,
    TemporalService,
    UpdateDeploymentActivity,
    UpdateDeploymentHandler,
    UpdateServiceHandler,
    UpdateServiceVersionHandler,
    WorkflowRunner,
  ],
})
export class ServicesModule {}
