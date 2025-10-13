import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { BilledDeploymentEntity } from './entities/billed-deployment';
import { BlobEntity } from './entities/blob';
import { CacheEntity } from './entities/cache';
import { DeploymentEntity } from './entities/deployment';
import { DeploymentCheckEntity } from './entities/deployment-check';
import { DeploymentLogEntity } from './entities/deployment-log';
import { DeploymentUpdateEntity } from './entities/deployment-update';
import { DeploymentUsageEntity } from './entities/deployment-usage';
import { ServiceEntity } from './entities/service';
import { ServiceVersionEntity } from './entities/service-version';
import { SessionEntity } from './entities/session';
import { SettingEntity } from './entities/setting';
import { TeamEntity } from './entities/team';
import { TeamUserEntity } from './entities/team-user';
import { UserEntity } from './entities/user';
import { UserGroupEntity } from './entities/user-group';
import { WorkerEntity } from './entities/worker';
import { Init1760346162798 } from './migrations/1760346162798-Init';
import { AddDefinitionSource1760346848861 } from './migrations/1760346848861-AddDefinitionSource';

config();

const configService = new ConfigService();

export default new DataSource({
  url: configService.getOrThrow('DB_URL'),
  type: (configService.get('DB_TYPE') || 'postgres') as 'postgres',
  entities: [
    BilledDeploymentEntity,
    BlobEntity,
    CacheEntity,
    DeploymentCheckEntity,
    DeploymentEntity,
    DeploymentLogEntity,
    DeploymentUpdateEntity,
    DeploymentUsageEntity,
    ServiceEntity,
    ServiceVersionEntity,
    SessionEntity,
    SettingEntity,
    TeamEntity,
    TeamUserEntity,
    UserEntity,
    UserGroupEntity,
    WorkerEntity,
  ],
  migrations: [Init1760346162798, AddDefinitionSource1760346848861],
});
