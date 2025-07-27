import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentUpdateEntity, ServiceEntity, ServiceVersionEntity, WorkerEntity } from 'src/domain/database';
import { TemporalService } from './services';
import {
  CreateDeploymentHandler,
  CreateServiceHandler,
  CreateServiceVersionHandler,
  DeleteDeploymentHandler,
  DeleteServiceHandler,
  DeleteServiceVersionHandler,
  GetServicesHandler,
  GetServicesPublicHandler,
  GetServiceVersionsHandler,
  GetTeamDeploymentsHandler,
  UpdateDeploymentHandler,
  UpdateServiceHandler,
  UpdateServiceVersionHandler,
} from './use-cases';
import { DeleteResourceActivity, DeployResourceActivity, UpdateDeploymentActivity } from './workflows/activities';
import { WorkflowRunner } from './workflows/runner';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceEntity, ServiceVersionEntity, DeploymentUpdateEntity, DeploymentEntity, WorkerEntity]),
  ],
  providers: [
    CreateDeploymentHandler,
    CreateServiceHandler,
    CreateServiceVersionHandler,
    DeleteDeploymentHandler,
    DeleteResourceActivity,
    DeleteServiceHandler,
    DeleteServiceVersionHandler,
    DeployResourceActivity,
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
