import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeploymentEntity,
  DeploymentRepository,
  DeploymentUpdateStepEntity,
  DeploymentUpdateStepRepository,
} from 'src/domain/database';
import { DeploymentUpdateStep } from '../interfaces';
import { DeploymentPolicy } from '../policies';

export class GetDeploymentStepsQuery extends Query<GetDeploymentStepsResult> {
  constructor(
    public readonly deploymentId: number,
    public readonly policy: DeploymentPolicy,
  ) {
    super();
  }
}

export class GetDeploymentStepsResult {
  constructor(public readonly steps: DeploymentUpdateStep[]) {}
}

@QueryHandler(GetDeploymentStepsQuery)
export class GetDeploymentStepsHandler implements IQueryHandler<GetDeploymentStepsQuery, GetDeploymentStepsResult> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentUpdateStepEntity)
    private readonly deploymentSteps: DeploymentUpdateStepRepository,
  ) {}

  async execute(query: GetDeploymentStepsQuery) {
    const { deploymentId, policy } = query;

    const deployment = await this.deployments.findOne({
      where: { id: deploymentId },
      relations: ['updates'],
    });

    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    if (!policy.isAllowed(deployment)) {
      throw new ForbiddenException();
    }

    // The steps of the most recent update are the ones shown in the UI.
    const latestUpdate = deployment.updates.sort((a, b) => b.id - a.id)[0];
    if (!latestUpdate) {
      return new GetDeploymentStepsResult([]);
    }

    const entities = await this.deploymentSteps.find({
      where: { updateId: latestUpdate.id },
      order: { id: 'ASC' },
      relations: ['subSteps'],
    });

    const steps = entities.map(
      ({ action, attempt, completedAt, error, logs, resourceId, resourceName, startedAt, status, subSteps }) => ({
        action,
        attempt,
        completedAt,
        error,
        logs,
        resourceId,
        resourceName,
        startedAt,
        status,
        subSteps: [...subSteps]
          .sort((a, b) => a.id - b.id)
          .map(({ id, name, status, error, logs, startedAt, completedAt }) => ({
            id,
            name,
            status,
            error,
            logs,
            startedAt,
            completedAt,
          })),
      }),
    );

    return new GetDeploymentStepsResult(steps);
  }
}
