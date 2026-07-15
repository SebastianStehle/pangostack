import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { loadDbConfig } from './config';
import { DeploymentUpdateStepEntity } from './entities';
import { BilledDeploymentEntity } from './entities/billed-deployment';
import { BlobEntity } from './entities/blob';
import { CacheEntity } from './entities/cache';
import { DeploymentEntity } from './entities/deployment';
import { DeploymentCheckEntity } from './entities/deployment-check';
import { DeploymentLogEntity } from './entities/deployment-log';
import { DeploymentMetricEntity } from './entities/deployment-metric';
import { DeploymentUpdateEntity } from './entities/deployment-update';
import { DeploymentUsageEntity } from './entities/deployment-usage';
import { ServiceEntity } from './entities/service';
import { ServiceVersionEntity } from './entities/service-version';
import { SessionEntity } from './entities/session';
import { SettingEntity } from './entities/setting';
import { TeamEntity } from './entities/team';
import { TeamActivityEntity } from './entities/team-activity';
import { TeamUserEntity } from './entities/team-user';
import { UserEntity } from './entities/user';
import { UserGroupEntity } from './entities/user-group';
import { WorkerEntity } from './entities/worker';
import { ALL_MIGRATIONS } from './migrations';

config();

export default new DataSource({
  ...loadDbConfig(),
  entities: [
    BilledDeploymentEntity,
    BlobEntity,
    CacheEntity,
    DeploymentCheckEntity,
    DeploymentEntity,
    DeploymentLogEntity,
    DeploymentMetricEntity,
    DeploymentUpdateEntity,
    DeploymentUpdateStepEntity,
    DeploymentUsageEntity,
    ServiceEntity,
    ServiceVersionEntity,
    SessionEntity,
    SettingEntity,
    TeamActivityEntity,
    TeamEntity,
    TeamUserEntity,
    UserEntity,
    UserGroupEntity,
    WorkerEntity,
  ],
  migrations: [...ALL_MIGRATIONS],
});
