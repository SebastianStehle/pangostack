import { InjectRepository } from '@nestjs/typeorm';
import {
  DeploymentUpdateStepEntity,
  DeploymentUpdateStepRepository,
  DeploymentUpdateSubStepEntity,
  DeploymentUpdateSubStepRepository,
} from 'src/domain/database';
import { Activity } from '../registration';

export type FailDeploymentStepParam = {
  stepId: number;
  error: string;
};

@Activity(failDeploymentStep)
export class FailDeploymentStepActivity implements Activity<FailDeploymentStepParam> {
  constructor(
    @InjectRepository(DeploymentUpdateStepEntity)
    private readonly deploymentSteps: DeploymentUpdateStepRepository,
    @InjectRepository(DeploymentUpdateSubStepEntity)
    private readonly deploymentSubSteps: DeploymentUpdateSubStepRepository,
  ) {}

  async execute({ error, stepId }: FailDeploymentStepParam) {
    const step = await this.deploymentSteps.findOne({ where: { id: stepId } });
    if (!step) {
      return;
    }

    step.status = 'Failed';
    step.error = error;
    step.completedAt = new Date();
    await this.deploymentSteps.save(step);

    // The last sub-step is the one that broke, close it as failed as well.
    const runningSubStep = await this.deploymentSubSteps.findOne({ where: { stepId, status: 'Running' } });
    if (runningSubStep) {
      runningSubStep.status = 'Failed';
      runningSubStep.completedAt = new Date();
      await this.deploymentSubSteps.save(runningSubStep);
    }
  }
}

export async function failDeploymentStep(param: FailDeploymentStepParam): Promise<any> {
  return param;
}
