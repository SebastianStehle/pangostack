import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DeploymentCheckEntity,
  DeploymentEntity,
  DeploymentMetricEntity,
  DeploymentUpdateEntity,
  DeploymentUpdateStepEntity,
  DeploymentUsageEntity,
  ServiceEntity,
  ServiceVersionEntity,
  WorkerEntity,
} from 'src/domain/database';
import { LibModule } from 'src/lib';
import { BillingModule } from '../billing';
import { WorkersModule } from '../workers';
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
  GetDeploymentMetricsHandler,
  GetDeploymentsHandler,
  GetDeploymentStatusHandler,
  GetDeploymentStepsHandler,
  GetDeploymentUsagesHandler,
  GetServicePublicHandler,
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
      DeploymentMetricEntity,
      DeploymentUpdateEntity,
      DeploymentUpdateStepEntity,
      DeploymentUsageEntity,
      ServiceEntity,
      ServiceVersionEntity,
      WorkerEntity,
    ]),
    WorkersModule,
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
    GetDeploymentMetricsHandler,
    GetDeploymentsHandler,
    GetDeploymentStatusHandler,
    GetDeploymentStepsHandler,
    GetDeploymentUsagesHandler,
    GetServicesHandler,
    GetServicePublicHandler,
    GetServicesPublicHandler,
    GetServiceVersionsHandler,
    UpdateDeploymentHandler,
    UpdateServiceHandler,
    UpdateServiceVersionHandler,
    VerifyDefinitionHandler,
  ],
})
export class ServicesModule {}
