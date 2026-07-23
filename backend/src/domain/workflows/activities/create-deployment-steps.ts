import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeploymentStepAction,
  DeploymentStepKey,
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  DeploymentUpdateStepEntity,
  DeploymentUpdateStepRepository,
} from 'src/domain/database';
import { Activity } from '../registration';

export type CreateDeploymentStepsParam = {
  updateId: number;
  previousUpdateId?: number | null;
  steps: DeploymentStepKey[];
};

export type CreatedDeploymentStep = DeploymentStepKey & { stepId: number };

export type CreateDeploymentStepsResult = {
  steps: CreatedDeploymentStep[];
};

@Activity(createDeploymentSteps)
export class CreateDeploymentStepsActivity implements Activity<CreateDeploymentStepsParam> {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(DeploymentUpdateStepEntity)
    private readonly deploymentSteps: DeploymentUpdateStepRepository,
  ) {}

  async execute({ previousUpdateId, steps, updateId }: CreateDeploymentStepsParam) {
    const update = await this.deploymentUpdates.findOne({ where: { id: updateId }, relations: ['serviceVersion'] });
    if (!update) {
      throw new NotFoundException(`Deployment Update ${updateId} not found.`);
    }

    // Deleted resources are no longer part of the current definition, therefore
    // their names must be resolved from the previous update.
    let previousUpdate: DeploymentUpdateEntity | null = null;
    if (previousUpdateId) {
      previousUpdate = await this.deploymentUpdates.findOne({ where: { id: previousUpdateId }, relations: ['serviceVersion'] });
    }

    const resolveName = (resourceId: string, action: DeploymentStepAction) => {
      const definition =
        action === 'Delete' && previousUpdate ? previousUpdate.serviceVersion.definition : update.serviceVersion.definition;

      return definition.resources.find((x) => x.id === resourceId)?.name || resourceId;
    };

    // The workflow can be retried, therefore remove previously planned steps first.
    await this.deploymentSteps.delete({ updateId });

    const created: CreatedDeploymentStep[] = [];

    for (const { action, resourceId } of steps) {
      const step = new DeploymentUpdateStepEntity();
      step.updateId = updateId;
      step.resourceId = resourceId;
      step.resourceName = resolveName(resourceId, action);
      step.action = action;
      step.status = 'Pending';

      const saved = await this.deploymentSteps.save(step);
      created.push({ action, resourceId, stepId: saved.id });
    }

    return { steps: created };
  }
}

export async function createDeploymentSteps(param: CreateDeploymentStepsParam): Promise<CreateDeploymentStepsResult> {
  return { steps: param.steps.map((step) => ({ ...step, stepId: 0 })) };
}
