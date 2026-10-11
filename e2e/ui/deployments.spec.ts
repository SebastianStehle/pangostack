import { createDeployment, createService } from 'src/shared/setup';
import { waitForDeployment } from 'src/shared/wait';
import { expect, test } from './fixtures';
import { texts } from './texts';

const DEPLOYMENT_TIMEOUT_MS = 90_000;

test.describe('catalog', () => {
  test.beforeEach(async ({ catalogPage, team }) => {
    await catalogPage.goto(team.id);
  });

  test('should list public service in catalog', async ({ catalogPage, service }) => {
    await expect(catalogPage.service(service.name)).toBeVisible();
  });

  test('should deploy service from catalog with parameters', async ({ catalogPage, deploymentFormPage, deploymentPage, service }) => {
    // STEP 1: Select service.
    await catalogPage.select(service.name);

    // STEP 2: Deploy with parameters.
    await deploymentFormPage.deploy({ Greeting: 'Catalog' });

    // STEP 3: Wait until the deployment succeeded.
    await expect(deploymentPage.status).toContainText(texts.common.succeeded, { timeout: DEPLOYMENT_TIMEOUT_MS });
    await expect(deploymentPage.property('Greeting')).toContainText('Catalog');
  });
});

test('should list deployment with status in team', async ({ teamDeploymentsPage, team, deployment }) => {
  // STEP 1: Open deployments of team.
  await teamDeploymentsPage.goto(team.id);

  await expect(teamDeploymentsPage.deployment(deployment.serviceName)).toContainText(texts.common.succeeded);
});

test('should show reason when deployment fails', async ({ deploymentPage, admin, team }) => {
  // STEP 1: Create failing deployment through the API.
  const { service } = await createService(admin, 'broken.yaml');
  const { id } = await createDeployment(admin, team.id, service.id);
  await waitForDeployment(admin, id, 'Failed');

  // STEP 2: Open deployment.
  await deploymentPage.goto(team.id, id);

  await expect(deploymentPage.status).toContainText(texts.common.failed);
  await expect(deploymentPage.stepError('e2e-image-does-not-exist')).toBeVisible();
});

test.describe('deployment page', () => {
  test.beforeEach(async ({ deploymentPage, team, deployment }) => {
    await deploymentPage.goto(team.id, deployment.id);
  });

  test('should show deployed resource with its steps', async ({ deploymentPage }) => {
    // STEP 1: Expand steps of the resource.
    await deploymentPage.expandSteps('App');

    await expect(deploymentPage.subStep('App', 'Waiting for SSH connection')).toBeVisible();
    await expect(deploymentPage.subStep('App', 'Starting containers')).toBeVisible();
  });

  test('should show container output in log viewer', async ({ deploymentPage }) => {
    // STEP 1: Open log viewer.
    await deploymentPage.openLogs();

    await expect(deploymentPage.logOutput('Hello World')).toBeVisible();
  });

  test('should apply new parameters when deployment is edited', async ({ deploymentPage, deploymentFormPage }) => {
    // STEP 1: Edit parameters.
    await deploymentPage.edit();
    await deploymentFormPage.deploy({ Greeting: 'Edited' });

    // STEP 2: Wait until the update succeeded.
    await expect(deploymentPage.property('Greeting')).toContainText('Edited');
    await expect(deploymentPage.status).toContainText(texts.common.succeeded, { timeout: DEPLOYMENT_TIMEOUT_MS });
  });
});
