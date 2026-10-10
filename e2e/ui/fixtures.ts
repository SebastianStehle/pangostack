import { test as base } from '@playwright/test';
import { DeploymentDto, ServiceDto, TeamDto } from 'src/api/generated';
import { Clients, createAdminClients } from 'src/shared/clients';
import { createDeployment, createService, createTeam } from 'src/shared/setup';
import { waitForDeployment } from 'src/shared/wait';
import { AdminDeploymentPage } from './pages/admin-deployment-page';
import { AdminDeploymentsPage } from './pages/admin-deployments-page';
import { AdminNewVersionPage } from './pages/admin-new-version-page';
import { AdminServicePage } from './pages/admin-service-page';
import { AdminServicesPage } from './pages/admin-services-page';
import { AdminUsersPage } from './pages/admin-users-page';
import { AdminWorkersPage } from './pages/admin-workers-page';
import { CatalogPage } from './pages/catalog-page';
import { DeploymentFormPage } from './pages/deployment-form-page';
import { DeploymentPage } from './pages/deployment-page';
import { LoginPage } from './pages/login-page';
import { MembersPage } from './pages/members-page';
import { TeamCreatePage } from './pages/team-create-page';
import { TeamDeploymentsPage } from './pages/team-deployments-page';

type Pages = {
  adminDeploymentPage: AdminDeploymentPage;
  adminDeploymentsPage: AdminDeploymentsPage;
  adminNewVersionPage: AdminNewVersionPage;
  adminServicePage: AdminServicePage;
  adminServicesPage: AdminServicesPage;
  adminUsersPage: AdminUsersPage;
  adminWorkersPage: AdminWorkersPage;
  catalogPage: CatalogPage;
  deploymentFormPage: DeploymentFormPage;
  deploymentPage: DeploymentPage;
  loginPage: LoginPage;
  membersPage: MembersPage;
  teamCreatePage: TeamCreatePage;
  teamDeploymentsPage: TeamDeploymentsPage;
};

type TestFixtures = Pages & {
  team: TeamDto;
  deployment: DeploymentDto;
};

type WorkerFixtures = {
  admin: Clients;
  service: ServiceDto;
};

// Tests only talk to page objects, so that selectors live in one place.
export const test = base.extend<TestFixtures, WorkerFixtures>({
  adminDeploymentPage: async ({ page }, use) => {
    await use(new AdminDeploymentPage(page));
  },
  adminDeploymentsPage: async ({ page }, use) => {
    await use(new AdminDeploymentsPage(page));
  },
  adminNewVersionPage: async ({ page }, use) => {
    await use(new AdminNewVersionPage(page));
  },
  adminServicePage: async ({ page }, use) => {
    await use(new AdminServicePage(page));
  },
  adminServicesPage: async ({ page }, use) => {
    await use(new AdminServicesPage(page));
  },
  adminUsersPage: async ({ page }, use) => {
    await use(new AdminUsersPage(page));
  },
  adminWorkersPage: async ({ page }, use) => {
    await use(new AdminWorkersPage(page));
  },
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
  deploymentFormPage: async ({ page }, use) => {
    await use(new DeploymentFormPage(page));
  },
  deploymentPage: async ({ page }, use) => {
    await use(new DeploymentPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  membersPage: async ({ page }, use) => {
    await use(new MembersPage(page));
  },
  teamCreatePage: async ({ page }, use) => {
    await use(new TeamCreatePage(page));
  },
  teamDeploymentsPage: async ({ page }, use) => {
    await use(new TeamDeploymentsPage(page));
  },

  // The data is arranged over the API, so that each test only drives the screen it is about.
  admin: [
    async ({}, use) => {
      await use(createAdminClients());
    },
    { scope: 'worker' },
  ],
  service: [
    async ({ admin }, use) => {
      const { service } = await createService(admin, 'busybox.yaml');

      await use(service);
    },
    { scope: 'worker' },
  ],
  team: async ({ admin }, use) => {
    await use(await createTeam(admin));
  },
  deployment: async ({ admin, team, service }, use) => {
    const { id } = await createDeployment(admin, team.id, service.id, { greeting: 'World' });

    await use(await waitForDeployment(admin, id, 'Completed'));
  },
});

export const ANONYMOUS = { cookies: [], origins: [] };

export { expect } from '@playwright/test';
