import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerEntity } from 'src/domain/database';
import { WorkerInitializer } from './initializer';

@Module({
  imports: [ConfigModule, CqrsModule, TypeOrmModule.forFeature([WorkerEntity])],
  providers: [WorkerInitializer],
})
export class WorkerModule {}
