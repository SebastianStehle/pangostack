import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerEntity } from 'src/domain/database';
import { WorkerInitializerService } from './services';
import { GetResourceTypesHandler, GetWorkersHandler } from './use-cases';

@Module({
  imports: [ConfigModule, CqrsModule, TypeOrmModule.forFeature([WorkerEntity])],
  providers: [GetResourceTypesHandler, GetWorkersHandler, WorkerInitializerService],
})
export class WorkersModule {}
