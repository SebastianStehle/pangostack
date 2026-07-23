import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerEntity } from 'src/domain/database';
import { WorkerInitializerService, WorkerResolver } from './services';
import {
  CreateWorkerHandler,
  DeleteWorkerHandler,
  GetResourceTypesHandler,
  GetWorkersHandler,
  UpdateWorkerHandler,
} from './use-cases';

@Module({
  imports: [ConfigModule, CqrsModule, TypeOrmModule.forFeature([WorkerEntity])],
  providers: [
    CreateWorkerHandler,
    DeleteWorkerHandler,
    GetResourceTypesHandler,
    GetWorkersHandler,
    UpdateWorkerHandler,
    WorkerInitializerService,
    WorkerResolver,
  ],
  exports: [WorkerResolver],
})
export class WorkersModule {}
