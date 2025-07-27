import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentUpdateEntity, ServiceEntity, ServiceVersionEntity, WorkerEntity } from 'src/domain/database';
import { TemporalService } from './services';
import {
  CreateDeploymentHandler,
  CreateService,
  CreateServiceVersion,
  DeleteDeploymentHandler,
  DeleteService,
  DeleteServiceVersion,
  GetServices,
  GetServicesPublic,
  GetServiceVersions,
  GetTeamDeploymentsHandler,
  UpdateDeploymentHandler,
  UpdateService,
  UpdateServiceVersion,
} from './use-cases';
import { DeleteResourceActivity, DeployResourceActivity, UpdateDeploymentActivity } from './workflows/activities';
import { WorkflowRunner } from './workflows/runner';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceEntity, ServiceVersionEntity, DeploymentUpdateEntity, DeploymentEntity, WorkerEntity]),
  ],
  providers: [
    CreateDeploymentHandler,
    CreateService,
    CreateServiceVersion,
    DeleteDeploymentHandler,
    DeleteResourceActivity,
    DeleteService,
    DeleteServiceVersion,
    DeployResourceActivity,
    GetTeamDeploymentsHandler,
    GetServices,
    GetServicesPublic,
    GetServiceVersions,
    TemporalService,
    UpdateDeploymentActivity,
    UpdateDeploymentHandler,
    UpdateService,
    UpdateServiceVersion,
    WorkflowRunner,
  ],
})
export class ServicesModule {}
