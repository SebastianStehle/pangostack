import { ServiceDto } from 'src/api/generated';
import { randomName } from 'src/shared/random';
import { createServiceWithoutVersion, readDefinition, USER_PASSWORD } from 'src/shared/setup';
import { waitForDeploymentDeleted } from 'src/shared/wait';
import { expect, test } from './fixtures';
import { texts } from './texts';

test('should create service in dialog', async ({ adminServicesPage, adminServicePage }) => {
  const name = randomName('service');

  // STEP 1: Create service.
  await adminServicesPage.goto();
  await adminServicesPage.create(name, 'Created in the UI test.');

  await expect(adminServicePage.heading(name)).toBeVisible();
});

test.describe('new version', () => {
  let service: ServiceDto;

  test.beforeEach(async ({ admin, adminNewVersionPage }) => {
    service = await createServiceWithoutVersion(admin);

    await adminNewVersionPage.goto(service.id);
    await adminNewVersionPage.setDefinition(readDefinition('busybox.yaml'));
  });

  test('should create version from yaml definition', async ({ adminNewVersionPage, adminServicePage }) => {
    // STEP 1: Save version.
    await adminNewVersionPage.save('1.0.0');

    await expect(adminServicePage.heading(service.name)).toBeVisible();
    await expect(adminServicePage.version('1.0.0')).toBeVisible();
  });

  test('should confirm valid definition when verified', async ({ adminNewVersionPage }) => {
    // STEP 1: Verify definition.
    await adminNewVersionPage.verify();

    await expect(adminNewVersionPage.verifySuccess).toBeVisible();
  });
});

test('should open deployment from admin list', async ({ adminDeploymentsPage, adminDeploymentPage, deployment }) => {
  // STEP 1: Open deployment from list.
  await adminDeploymentsPage.goto();
  await adminDeploymentsPage.open(deployment.id);

  await expect(adminDeploymentPage.status).toContainText(texts.common.succeeded);
});

test('should delete deployment when confirmed', async ({ adminDeploymentPage, admin, deployment }) => {
  // STEP 1: Delete deployment.
  await adminDeploymentPage.goto(deployment.id);
  await adminDeploymentPage.delete();

  await expect(adminDeploymentPage.deleteConfirmed).toBeVisible();

  // STEP 2: Wait until the resources are deleted.
  await waitForDeploymentDeleted(admin, deployment.id);
});

test('should create user in dialog', async ({ adminUsersPage }) => {
  const email = `${randomName('user')}@pango.test`;

  // STEP 1: Create user.
  await adminUsersPage.goto();
  await adminUsersPage.create({ name: randomName('user'), email, password: USER_PASSWORD });

  await expect(adminUsersPage.user(email)).toBeVisible();
});

test('should show worker with its resource types', async ({ adminWorkersPage }) => {
  // STEP 1: Open workers.
  await adminWorkersPage.goto();

  await expect(adminWorkersPage.worker('http://worker:3100')).toContainText('docker-compose-ssh');
});
