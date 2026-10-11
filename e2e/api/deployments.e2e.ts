import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { DeploymentDto, ServiceDto, TeamDto } from 'src/api/generated';
import { createAdminClients, getStatusCode } from 'src/shared/clients';
import { scrub } from 'src/shared/scrub';
import { createDeployment, createService, createTeam, createUser, TestUser } from 'src/shared/setup';
import { getComposeProject, getTargetContainers } from 'src/shared/target';
import { waitForDeployment, waitForDeploymentDeleted } from 'src/shared/wait';

describe('deployments', () => {
  const admin = createAdminClients();

  let service: ServiceDto;
  let team: TeamDto;
  let user: TestUser;
  let deployment: DeploymentDto;

  async function createCompletedDeployment() {
    const { id } = await createDeployment(admin, team.id, service.id, { greeting: 'World' });

    return waitForDeployment(admin, id, 'Completed');
  }

  beforeAll(async () => {
    ({ service } = await createService(admin, 'busybox.yaml'));
    team = await createTeam(admin);
    user = await createUser(admin);

    // Deploying takes a few seconds, so all read-only tests share one deployment.
    deployment = await createCompletedDeployment();
  });

  it('should complete deployment when containers are started', async () => {
    // STEP 1: Get steps of the completed deployment.
    const { steps } = await admin.deployments.getDeploymentSteps(deployment.id);

    await expect(scrub({ deployment, steps }, [deployment.serviceName])).toMatchFileSnapshot('./__snapshots__/deployment-completed.snap');
  });

  it('should report running containers when status is queried', async () => {
    // STEP 1: Get live status.
    const { resources } = await admin.deployments.getDeploymentStatus(deployment.id);

    expect(resources[0].workloads[0].nodes).toMatchObject([{ name: 'app-1', isReady: true }]);
    expect(resources[0].properties['busybox/version'].value).toBe('1.37');
  });

  it('should pass parameters to containers when deployed', async () => {
    // STEP 1: Get container logs.
    const { resources } = await admin.deployments.getDeploymentLogs(deployment.id);
    expect(resources[0].instances[0].messages).toContain('Hello World');
  });

  it('should forbid access to deployment when user is not a team member', async () => {
    // STEP 1: Get deployment as a user outside of the team.
    const status = await getStatusCode(() => user.clients.deployments.getDeployment(deployment.id));
    expect(status).toBe(403);
  });

  it('should reject deployment when required parameter is missing', async () => {
    // STEP 1: Create deployment without parameters.
    const status = await getStatusCode(() => createDeployment(admin, team.id, service.id, {}));
    expect(status).toBe(400);
  });

  it('should fail deployment with step error when image does not exist', async () => {
    // STEP 1: Create deployment of a service with a broken compose file.
    const { service: broken } = await createService(admin, 'broken.yaml');

    const { id } = await createDeployment(admin, team.id, broken.id);
    await waitForDeployment(admin, id, 'Failed');

    // STEP 2: Get steps.
    const { steps } = await admin.deployments.getDeploymentSteps(id);
    expect(steps).toMatchObject([{ resourceId: 'app', status: 'Failed', attempt: 1 }]);
    expect(steps[0].error).toContain('e2e-image-does-not-exist');
  });

  describe('when changed', () => {
    let changed: DeploymentDto;

    beforeEach(async () => {
      changed = await createCompletedDeployment();
    });

    it('should apply new parameters when deployment is updated', async () => {
      // STEP 1: Update parameters.
      await admin.deployments.putDeployment(changed.id, { name: null, versionId: null, parameters: { greeting: 'Pango' } });
      await waitForDeployment(admin, changed.id, 'Completed');

      // STEP 2: Get container logs.
      const { resources } = await admin.deployments.getDeploymentLogs(changed.id);
      expect(resources[0].instances[0].messages).toContain('Hello Pango');
    });

    it('should remove containers when deployment is deleted', async () => {
      const project = getComposeProject(changed.id, 'app');
      expect(getTargetContainers(project)).toHaveLength(1);

      // STEP 1: Delete deployment.
      await admin.deployments.deleteDeployment(changed.id);
      await waitForDeploymentDeleted(admin, changed.id);

      expect(getTargetContainers(project)).toHaveLength(0);
    });
  });
});
