import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DeploymentCheckEntity,
  DeploymentEntity,
  DeploymentUpdateEntity,
  DeploymentUsageEntity,
  ServiceEntity,
  ServiceVersionEntity,
  WorkerEntity,
} from 'src/domain/database';
import { LibModule } from 'src/lib';
import { BillingModule } from '../billing';
import { WorkflowModule } from '../workflows';
import {
  CancelDeploymentHandler,
  ConfirmDeploymentHandler,
  CreateDeploymentHandler,
  CreateServiceHandler,
  CreateServiceVersionHandler,
  DeleteDeploymentHandler,
  DeleteServiceHandler,
  DeleteServiceVersionHandler,
  GetDeploymentChecksHandler,
  GetDeploymentHandler,
  GetDeploymentLogsHandler,
  GetDeploymentsHandler,
  GetDeploymentStatusHandler,
  GetDeploymentUsagesHandler,
  GetServicesHandler,
  GetServicesPublicHandler,
  GetServiceVersionsHandler,
  UpdateDeploymentHandler,
  UpdateServiceHandler,
  UpdateServiceVersionHandler,
  VerifyDefinitionHandler,
} from './use-cases';

@Module({
  imports: [
    BillingModule,
    ConfigModule,
    LibModule,
    TypeOrmModule.forFeature([
      DeploymentCheckEntity,
      DeploymentEntity,
      DeploymentUpdateEntity,
      DeploymentUsageEntity,
      ServiceEntity,
      ServiceVersionEntity,
      WorkerEntity,
    ]),
    WorkflowModule,
  ],
  providers: [
    CancelDeploymentHandler,
    ConfirmDeploymentHandler,
    CreateDeploymentHandler,
    CreateServiceHandler,
    CreateServiceVersionHandler,
    DeleteDeploymentHandler,
    DeleteServiceHandler,
    DeleteServiceVersionHandler,
    GetDeploymentChecksHandler,
    GetDeploymentHandler,
    GetDeploymentHandler,
    GetDeploymentHandler,
    GetDeploymentLogsHandler,
    GetDeploymentsHandler,
    GetDeploymentStatusHandler,
    GetDeploymentUsagesHandler,
    GetServicesHandler,
    GetServicesPublicHandler,
    GetServiceVersionsHandler,
    UpdateDeploymentHandler,
    UpdateServiceHandler,
    UpdateServiceVersionHandler,
    VerifyDefinitionHandler,
  ],
})
export class ServicesModule {}
