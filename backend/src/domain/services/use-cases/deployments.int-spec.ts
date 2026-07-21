import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  asUser,
  createIntegrationTest,
  IntegrationTestContext,
  seedDeployment,
  seedReachableWorker,
  seedService,
  seedServiceVersion,
  seedTeam,
  seedUser,
  seedWorker,
  uniqueId,
} from 'test/integration/setup';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { BillingService } from 'src/domain/billing';
import {
  DeploymentCheckEntity,
  DeploymentEntity,
  DeploymentMetricEntity,
  DeploymentUpdateEntity,
  DeploymentUpdateStepEntity,
  DeploymentUsageEntity,
  ServiceEntity,
  ServiceVersionEntity,
  WorkerEntity,
} from 'src/domain/database';
import { WorkerResolver } from 'src/domain/workers';
import { WorkflowService } from 'src/domain/workflows';
import { UrlService } from 'src/lib';
import { AllowAllDeploymentPolicy, AllowTeamDeploymentPolicy } from '../policies';
import {
  CancelDeployment,
  CancelDeploymentHandler,
  ConfirmDeployment,
  ConfirmDeploymentHandler,
  CreateDeployment,
  CreateDeploymentHandler,
  CreateDeploymentResult,
  DeleteDeployment,
  DeleteDeploymentHandler,
  GetDeploymentChecksHandler,
  GetDeploymentChecksQuery,
  GetDeploymentChecksResult,
  GetDeploymentHandler,
  GetDeploymentLogsHandler,
  GetDeploymentLogsQuery,
  GetDeploymentMetricsHandler,
  GetDeploymentMetricsQuery,
  GetDeploymentMetricsResult,
  GetDeploymentQuery,
  GetDeploymentResult,
  GetDeploymentsHandler,
  GetDeploymentsQuery,
  GetDeploymentsResult,
  GetDeploymentStatusHandler,
  GetDeploymentStatusQuery,
  GetDeploymentStepsHandler,
  GetDeploymentStepsQuery,
  GetDeploymentStepsResult,
  GetDeploymentUsagesHandler,
  GetDeploymentUsagesQuery,
  GetDeploymentUsagesResult,
  UpdateDeployment,
  UpdateDeploymentHandler,
  UpdateDeploymentResult,
} from '.';

// The workflows barrel has a circular import with the services domain (workflows -> activities ->
// services -> workflows). Under SWC that leaves WorkflowService undefined when the handler's DI
// metadata is emitted, so we replace the module with a plain token that both the handler and this
// test share. It also keeps the Temporal client out of the test.
vi.mock('src/domain/workflows', () => ({ WorkflowService: class WorkflowService {} }));

const policy = new AllowAllDeploymentPolicy();
const denyPolicy = new AllowTeamDeploymentPolicy([]);
const workflows = { createDeployment: vi.fn(), deleteDeployment: vi.fn() };
const billing = {
  hasSubscription: vi.fn().mockResolvedValue(true),
  createSubscription: vi.fn().mockResolvedValue(true),
  getBillingPortalLink: vi.fn(),
  chargeDeployment: vi.fn(),
  getInvoices: vi.fn(),
};
const urlService = { confirmUrl: vi.fn().mockReturnValue('http://confirm'), cancelUrl: vi.fn().mockReturnValue('http://cancel') };

const today = new Date().toISOString().slice(0, 10);
const MISSING_ID = 2147483000;

describe('deployments handlers', () => {
  let context: IntegrationTestContext;

  beforeAll(async () => {
    context = await createIntegrationTest({
      imports: [
        EventEmitterModule.forRoot(),
        TypeOrmModule.forFeature([
          DeploymentEntity,
          DeploymentCheckEntity,
          DeploymentMetricEntity,
          DeploymentUpdateEntity,
          DeploymentUpdateStepEntity,
          DeploymentUsageEntity,
          ServiceEntity,
          ServiceVersionEntity,
          WorkerEntity,
        ]),
      ],
      providers: [
        GetDeploymentHandler,
        GetDeploymentsHandler,
        GetDeploymentStepsHandler,
        GetDeploymentChecksHandler,
        GetDeploymentUsagesHandler,
        GetDeploymentMetricsHandler,
        GetDeploymentStatusHandler,
        GetDeploymentLogsHandler,
        CreateDeploymentHandler,
        ConfirmDeploymentHandler,
        CancelDeploymentHandler,
        UpdateDeploymentHandler,
        DeleteDeploymentHandler,
        WorkerResolver,
        { provide: WorkflowService, useValue: workflows },
        { provide: BillingService, useValue: billing },
        { provide: UrlService, useValue: urlService },
      ],
    });
  });

  afterAll(async () => {
    await context.close();
  });

  describe('GetDeploymentQuery', () => {
    it('should return the deployment with its last update', async () => {
      const { deployment } = await seedDeployment(context.dataSource);

      const { deployment: result } = await context.queryBus.execute<GetDeploymentQuery, GetDeploymentResult>(
        new GetDeploymentQuery(deployment.id, policy),
      );

      expect(result?.id).toBe(deployment.id);
    });

    it('should throw when the policy denies access', async () => {
      const { deployment } = await seedDeployment(context.dataSource);

      await expect(context.queryBus.execute(new GetDeploymentQuery(deployment.id, denyPolicy))).rejects.toThrow();
    });
  });

  describe('GetDeploymentsQuery', () => {
    it('should return the deployments of a team', async () => {
      const { deployment, team } = await seedDeployment(context.dataSource);

      const { deployments, total } = await context.queryBus.execute<GetDeploymentsQuery, GetDeploymentsResult>(
        new GetDeploymentsQuery(0, 10, team.id),
      );

      expect(total).toBe(1);
      expect(deployments.map((entry) => entry.id)).toContain(deployment.id);
    });

    it('should exclude pending deployments of a team', async () => {
      const { team } = await seedDeployment(context.dataSource, { status: 'Pending' });

      const { total } = await context.queryBus.execute<GetDeploymentsQuery, GetDeploymentsResult>(
        new GetDeploymentsQuery(0, 10, team.id),
      );

      expect(total).toBe(0);
    });
  });

  describe('GetDeploymentStepsQuery', () => {
    it('should return the steps of the latest update', async () => {
      const { deployment, update } = await seedDeployment(context.dataSource);
      await context.dataSource
        .getRepository(DeploymentUpdateStepEntity)
        .save({ updateId: update.id, resourceId: 'r1', resourceName: 'Resource 1' });

      const { steps } = await context.queryBus.execute<GetDeploymentStepsQuery, GetDeploymentStepsResult>(
        new GetDeploymentStepsQuery(deployment.id, policy),
      );

      expect(steps).toHaveLength(1);
      expect(steps[0].resourceId).toBe('r1');
    });

    it('should return no steps when the latest update has none', async () => {
      const { deployment } = await seedDeployment(context.dataSource);

      const { steps } = await context.queryBus.execute<GetDeploymentStepsQuery, GetDeploymentStepsResult>(
        new GetDeploymentStepsQuery(deployment.id, policy),
      );

      expect(steps).toEqual([]);
    });
  });

  describe('GetDeploymentChecksQuery', () => {
    it('should summarize failures per day', async () => {
      const { deployment } = await seedDeployment(context.dataSource);
      await context.dataSource
        .getRepository(DeploymentCheckEntity)
        .save({ deploymentId: deployment.id, status: 'Failed', log: null! });

      const { checks } = await context.queryBus.execute<GetDeploymentChecksQuery, GetDeploymentChecksResult>(
        new GetDeploymentChecksQuery(deployment.id, policy, today, today),
      );

      expect(checks).toHaveLength(1);
      expect(checks[0].totalFailures).toBe(1);
    });

    it('should summarize successes per day', async () => {
      const { deployment } = await seedDeployment(context.dataSource);
      await context.dataSource
        .getRepository(DeploymentCheckEntity)
        .save({ deploymentId: deployment.id, status: 'Succeeded', log: null! });

      const { checks } = await context.queryBus.execute<GetDeploymentChecksQuery, GetDeploymentChecksResult>(
        new GetDeploymentChecksQuery(deployment.id, policy, today, today),
      );

      expect(checks[0].totalSuccesses).toBe(1);
    });
  });

  describe('GetDeploymentUsagesQuery', () => {
    it('should return a zero-filled summary when there is no usage', async () => {
      const { deployment } = await seedDeployment(context.dataSource);

      const { usages } = await context.queryBus.execute<GetDeploymentUsagesQuery, GetDeploymentUsagesResult>(
        new GetDeploymentUsagesQuery(deployment.id, policy, today, today),
      );

      expect(usages).toHaveLength(1);
      expect(usages[0].totalCores).toBe(0);
    });

    it('should throw when the deployment does not exist', async () => {
      await expect(context.queryBus.execute(new GetDeploymentUsagesQuery(MISSING_ID, policy, today, today))).rejects.toThrow(
        'not found',
      );
    });
  });

  describe('GetDeploymentMetricsQuery', () => {
    it('should return no metrics when the definition declares none', async () => {
      const { deployment } = await seedDeployment(context.dataSource);

      const { metrics } = await context.queryBus.execute<GetDeploymentMetricsQuery, GetDeploymentMetricsResult>(
        new GetDeploymentMetricsQuery(deployment.id, policy, 24),
      );

      expect(metrics).toEqual([]);
    });

    it('should throw when the policy denies access', async () => {
      const { deployment } = await seedDeployment(context.dataSource);

      await expect(context.queryBus.execute(new GetDeploymentMetricsQuery(deployment.id, denyPolicy, 24))).rejects.toThrow();
    });
  });

  describe('GetDeploymentStatusQuery', () => {
    it('should fail when no worker is available', async () => {
      await context.dataSource.getRepository(WorkerEntity).clear();
      const { deployment } = await seedDeployment(context.dataSource);

      await expect(context.queryBus.execute(new GetDeploymentStatusQuery(deployment.id, policy))).rejects.toThrow(
        'No worker available.',
      );
    });

    it('should return no statuses when there is no completed update', async () => {
      await context.dataSource.getRepository(WorkerEntity).clear();
      await seedWorker(context.dataSource);
      const { deployment } = await seedDeployment(context.dataSource, {}, { status: 'Running' });

      const { resources } = await context.queryBus.execute(new GetDeploymentStatusQuery(deployment.id, policy));

      expect(resources).toEqual([]);
    });
  });

  describe('GetDeploymentLogsQuery', () => {
    it('should fail when no worker is available', async () => {
      await context.dataSource.getRepository(WorkerEntity).clear();
      const { deployment } = await seedDeployment(context.dataSource);

      await expect(context.queryBus.execute(new GetDeploymentLogsQuery(deployment.id, policy))).rejects.toThrow(
        'No worker available.',
      );
    });

    it('should return no logs when there is no completed update', async () => {
      await context.dataSource.getRepository(WorkerEntity).clear();
      await seedWorker(context.dataSource);
      const { deployment } = await seedDeployment(context.dataSource, {}, { status: 'Running' });

      const { resources } = await context.queryBus.execute(new GetDeploymentLogsQuery(deployment.id, policy));

      expect(resources).toEqual([]);
    });
  });

  describe('CancelDeployment', () => {
    it('should delete a pending deployment when the token matches', async () => {
      const { deployment } = await seedDeployment(context.dataSource, { status: 'Pending', confirmToken: 'tok' });

      await context.commandBus.execute(new CancelDeployment(deployment.id, 'tok'));

      expect(await context.dataSource.getRepository(DeploymentEntity).findOneBy({ id: deployment.id })).toBeNull();
    });

    it('should reject a token mismatch and keep the deployment', async () => {
      const { deployment } = await seedDeployment(context.dataSource, { status: 'Pending', confirmToken: 'tok' });

      await expect(context.commandBus.execute(new CancelDeployment(deployment.id, 'wrong'))).rejects.toThrow();
      expect(await context.dataSource.getRepository(DeploymentEntity).findOneBy({ id: deployment.id })).not.toBeNull();
    });
  });

  describe('ConfirmDeployment', () => {
    it('should mark the deployment as created and start the workflow', async () => {
      await seedReachableWorker(context.dataSource);
      const { deployment, team } = await seedDeployment(context.dataSource, { status: 'Pending', confirmToken: 'tok' });

      await context.commandBus.execute(new ConfirmDeployment(team.id, deployment.id, 'tok'));

      const saved = await context.dataSource.getRepository(DeploymentEntity).findOneByOrFail({ id: deployment.id });
      expect(saved.status).toBe('Created');
      expect(workflows.createDeployment).toHaveBeenCalled();
    });

    it('should reject a token mismatch', async () => {
      await seedWorker(context.dataSource);
      const { deployment, team } = await seedDeployment(context.dataSource, { status: 'Pending', confirmToken: 'tok' });

      await expect(context.commandBus.execute(new ConfirmDeployment(team.id, deployment.id, 'wrong'))).rejects.toThrow();
    });
  });

  describe('CreateDeployment', () => {
    it('should create a deployment and start the workflow when billing is immediate', async () => {
      await seedReachableWorker(context.dataSource);
      const team = await seedTeam(context.dataSource);
      const service = await seedService(context.dataSource, { isPublic: true });
      await seedServiceVersion(context.dataSource, service.id, { isActive: true });
      const user = asUser(await seedUser(context.dataSource));

      const { deploymentOrRedirectUrl } = await context.commandBus.execute<CreateDeployment, CreateDeploymentResult>(
        new CreateDeployment(team.id, uniqueId('dep'), service.id, {}, null, null, user),
      );

      expect(typeof deploymentOrRedirectUrl).toBe('object');
      expect(workflows.createDeployment).toHaveBeenCalled();
    });

    it('should throw when the service has no active version', async () => {
      await seedWorker(context.dataSource);
      const team = await seedTeam(context.dataSource);
      const service = await seedService(context.dataSource, { isPublic: true });
      const user = asUser(await seedUser(context.dataSource));

      await expect(
        context.commandBus.execute<CreateDeployment, CreateDeploymentResult>(
          new CreateDeployment(team.id, uniqueId('dep'), service.id, {}, null, null, user),
        ),
      ).rejects.toThrow('no active version');
    });
  });

  describe('UpdateDeployment', () => {
    it('should rename the deployment and start the workflow', async () => {
      await seedReachableWorker(context.dataSource);
      const { deployment } = await seedDeployment(context.dataSource);
      const user = asUser(await seedUser(context.dataSource));
      const name = uniqueId('dep');

      await context.commandBus.execute<UpdateDeployment, UpdateDeploymentResult>(
        new UpdateDeployment(deployment.id, policy, name, null, null, user),
      );

      const saved = await context.dataSource.getRepository(DeploymentEntity).findOneByOrFail({ id: deployment.id });
      expect(saved.name).toBe(name);
      expect(workflows.createDeployment).toHaveBeenCalled();
    });

    it('should throw when there is no completed update', async () => {
      const { deployment } = await seedDeployment(context.dataSource, {}, { status: 'Running' });
      const user = asUser(await seedUser(context.dataSource));

      await expect(
        context.commandBus.execute<UpdateDeployment, UpdateDeploymentResult>(
          new UpdateDeployment(deployment.id, policy, uniqueId('dep'), null, null, user),
        ),
      ).rejects.toThrow('never really created');
    });
  });

  describe('DeleteDeployment', () => {
    it('should trigger the delete workflow for a created deployment', async () => {
      await seedReachableWorker(context.dataSource);
      const { deployment } = await seedDeployment(context.dataSource);
      const user = asUser(await seedUser(context.dataSource));

      await context.commandBus.execute(new DeleteDeployment(deployment.id, policy, user));

      expect(workflows.deleteDeployment).toHaveBeenCalled();
    });

    it('should not trigger the delete workflow for a pending deployment', async () => {
      workflows.deleteDeployment.mockClear();
      const { deployment } = await seedDeployment(context.dataSource, { status: 'Pending' });
      const user = asUser(await seedUser(context.dataSource));

      await context.commandBus.execute(new DeleteDeployment(deployment.id, policy, user));

      expect(workflows.deleteDeployment).not.toHaveBeenCalled();
    });
  });
});
