import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentUpdateEntity, ServiceEntity, ServiceVersionEntity, WorkerEntity } from 'src/domain/database';
import { BillingModule } from '../billing';
import { WorkflowModule } from '../workflows';
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

@Module({
  imports: [
    BillingModule,
    TypeOrmModule.forFeature([ServiceEntity, ServiceVersionEntity, DeploymentUpdateEntity, DeploymentEntity, WorkerEntity]),
    WorkflowModule,
  ],
  providers: [
    CreateDeploymentHandler,
    CreateServiceHandler,
    CreateServiceVersionHandler,
    DeleteDeploymentHandler,
    DeleteServiceHandler,
    DeleteServiceVersionHandler,
    GetDeploymentStatusHandler,
    GetTeamDeploymentsHandler,
    GetServicesHandler,
    GetServicesPublicHandler,
    GetServiceVersionsHandler,
    UpdateDeploymentHandler,
    UpdateServiceHandler,
    UpdateServiceVersionHandler,
  ],
})
export class ServicesModule {}
