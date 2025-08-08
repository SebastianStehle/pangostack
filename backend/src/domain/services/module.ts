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
import { BillingModule } from '../billing';
import { WorkflowModule } from '../workflows';
import { UrlService } from './services/url.service';
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
  GetDeploymentStatusHandler,
  GetDeploymentUsagesHandler,
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
    ConfigModule,
    TypeOrmModule.forFeature([
      DeploymentCheckEntity,
      DeploymentEntity,
      DeploymentUsageEntity,
      DeploymentUpdateEntity,
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
    GetDeploymentStatusHandler,
    GetDeploymentUsagesHandler,
    GetServicesHandler,
    GetServicesPublicHandler,
    GetServiceVersionsHandler,
    GetTeamDeploymentsHandler,
    UpdateDeploymentHandler,
    UpdateServiceHandler,
    UpdateServiceVersionHandler,
    UrlService,
  ],
  exports: [UrlService],
})
export class ServicesModule {}
