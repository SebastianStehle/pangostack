import { DataSource } from 'typeorm';
import { inject } from 'vitest';
import {
  DeploymentEntity,
  DeploymentUpdateEntity,
  ServiceEntity,
  ServiceVersionEntity,
  TeamEntity,
  TeamUserEntity,
  UserEntity,
  UserGroupEntity,
  WorkerEntity,
} from 'src/domain/database';
import { ServiceDefinition } from 'src/domain/definitions';
import { User } from 'src/domain/users/interfaces';
import { uniqueId } from './random';

// A minimal but valid service definition for versions that only need to exist.
export const EMPTY_DEFINITION = { resources: [], parameters: [] } as unknown as ServiceDefinition;

// Persists rows with unique random keys so seeded data never collides between tests or runs. Each
// factory accepts overrides for the fields a test actually cares about.
export async function seedUser(dataSource: DataSource, overrides: Partial<UserEntity> = {}) {
  const id = overrides.id ?? uniqueId('user');

  return dataSource.getRepository(UserEntity).save({ id, name: 'Test User', email: `${id}@example.com`, ...overrides });
}

export async function seedUserGroup(dataSource: DataSource, overrides: Partial<UserGroupEntity> = {}) {
  const id = overrides.id ?? uniqueId('group');

  return dataSource //
    .getRepository(UserGroupEntity)
    .save({ id, name: 'Test Group', isAdmin: false, isBuiltIn: false, ...overrides });
}

export async function seedTeam(dataSource: DataSource, overrides: Partial<TeamEntity> = {}) {
  return dataSource //
    .getRepository(TeamEntity)
    .save({ name: uniqueId('team'), ...overrides });
}

export async function seedTeamUser(dataSource: DataSource, teamId: number, userId: string, role = 'Admin') {
  return dataSource //
    .getRepository(TeamUserEntity)
    .save({ teamId, userId, role });
}

export async function seedService(dataSource: DataSource, overrides: Partial<ServiceEntity> = {}) {
  return dataSource //
    .getRepository(ServiceEntity)
    .save({ name: uniqueId('svc'), description: 'A test service.', ...overrides });
}

export async function seedServiceVersion(dataSource: DataSource, id: number, overrides: Partial<ServiceVersionEntity> = {}) {
  return dataSource //
    .getRepository(ServiceVersionEntity)
    .save({ name: uniqueId('v'), definition: EMPTY_DEFINITION, environment: {}, serviceId: id, ...overrides });
}

export async function seedWorker(dataSource: DataSource, overrides: Partial<WorkerEntity> = {}) {
  return dataSource //
    .getRepository(WorkerEntity)
    .save({ endpoint: 'http://localhost:9999', ...overrides });
}

export async function seedReachableWorker(dataSource: DataSource, overrides: Partial<WorkerEntity> = {}) {
  return dataSource //
    .getRepository(WorkerEntity)
    .save({ endpoint: inject('workerUrl'), ...overrides });
}
// Seeds a full deployment graph (team, service, version, deployment and one update) that the
// deployment handlers read through. Pass overrides to control the deployment/update rows.
export async function seedDeployment(
  dataSource: DataSource,
  deploymentOverrides: Partial<DeploymentEntity> = {},
  updateOverrides: Partial<DeploymentUpdateEntity> = {},
) {
  const team = await seedTeam(dataSource);
  const service = await seedService(dataSource);
  const version = await seedServiceVersion(dataSource, service.id, { isActive: true });

  const deployment = await dataSource.getRepository(DeploymentEntity).save({
    teamId: team.id,
    serviceId: service.id,
    status: 'Created',
    createdBy: 'system',
    updatedBy: 'system',
    ...deploymentOverrides,
  });

  const update = await dataSource.getRepository(DeploymentUpdateEntity).save({
    deploymentId: deployment.id,
    serviceVersionId: version.id,
    context: {},
    environment: {},
    parameters: {},
    log: {},
    status: 'Completed',
    createdBy: 'system',
    ...updateOverrides,
  });

  return { team, service, version, deployment, update };
}

export function asUser(entity: UserEntity): User {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    userGroupId: entity.userGroupId,
    hasPassword: !!entity.passwordHash,
  };
}
