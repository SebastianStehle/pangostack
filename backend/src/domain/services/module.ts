import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentUpdateEntity, ServiceEntity, ServiceVersionEntity, WorkerEntity } from 'src/domain/database';
import { TemporalService } from './services';
import { CreateDeploymentHandler, DeleteDeploymentHandler, GetDeploymentsHandler, UpdateDeploymentHandler } from './use-cases';
import { DeleteResourceActivity, DeployResourceActivity, UpdateDeploymentActivity } from './workflows/activities';
import { WorkflowRunner } from './workflows/runner';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceEntity, ServiceVersionEntity, DeploymentUpdateEntity, DeploymentEntity, WorkerEntity]),
  ],
  providers: [
    CreateDeploymentHandler,
    DeleteDeploymentHandler,
    DeleteResourceActivity,
    GetDeploymentsHandler,
    DeployResourceActivity,
    TemporalService,
    UpdateDeploymentActivity,
    UpdateDeploymentHandler,
    WorkflowRunner,
  ],
})
export class ServicesModule {}
