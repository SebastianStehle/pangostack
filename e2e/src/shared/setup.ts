import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { Clients, createClients } from './clients';
import { randomId, randomName } from './random';

const DEFINITIONS_URL = new URL('../../definitions/', import.meta.url);

export const USER_PASSWORD = 'e2e-Secret1';

export function readDefinition(fileName: string) {
  return readFileSync(fileURLToPath(new URL(fileName, DEFINITIONS_URL)), 'utf8');
}

export async function createService(admin: Clients, definitionFile: string, name = randomName('service')) {
  const service = await createServiceWithoutVersion(admin, name);

  const version = await admin.services.postServiceVersion(service.id, {
    name: '1.0.0',
    definition: readDefinition(definitionFile),
    environment: {},
    isActive: true,
  });

  return { service, version };
}

export async function createServiceWithoutVersion(admin: Clients, name = randomName('service')) {
  return admin.services.postService({
    name,
    description: 'Created by the e2e tests.',
    currency: 'EUR',
    environment: {},
    fixedPrice: 0,
    isPublic: true,
    pricePerCoreHour: 0,
    pricePerMemoryGBHour: 0,
    pricePerStorageGBMonth: 0,
    pricePerVolumeGBHour: 0,
  });
}

export async function createUser(admin: Clients) {
  const name = randomName('user');
  const email = `${name}@pango.test`;
  const apiKey = `${randomId()}${randomId()}`;

  const user = await admin.users.postUser({ name, email, apiKey, password: USER_PASSWORD, roles: null, userGroupId: 'default' });

  return { user, email, password: USER_PASSWORD, clients: createClients({ apiKey }) };
}

export async function createTeam(clients: Clients, name = randomName('team')) {
  return clients.teams.postTeam({ name });
}

export async function createDeployment(clients: Clients, teamId: number, serviceId: number, parameters: Record<string, unknown> = {}) {
  const { deployment } = await clients.deployments.postTeamDeployment(teamId, {
    name: null,
    serviceId,
    parameters,
    confirmUrl: null,
    cancelUrl: null,
  });
  if (!deployment) {
    throw new Error('Deployment was not started immediately. The e2e stack must run without billing.');
  }

  return deployment;
}

export type TestUser = Awaited<ReturnType<typeof createUser>>;
