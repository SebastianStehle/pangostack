import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentUpdateStepEntity, DeploymentUpdateStepRepository } from 'src/domain/database';
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
  ) {}

  async execute({ error, stepId }: FailDeploymentStepParam) {
    const step = await this.deploymentSteps.findOne({ where: { id: stepId } });
    if (!step) {
      return;
    }

    step.status = 'Failed';
    step.error = error;
    step.completedAt = new Date();

    // The last sub-step is the one that broke, close it as failed as well.
    const runningSubStep = step.subSteps.find((x) => x.status === 'Running');
    if (runningSubStep) {
      runningSubStep.status = 'Failed';
      runningSubStep.completedAt = new Date().toISOString();
    }

    await this.deploymentSteps.save(step);
  }
}

export async function failDeploymentStep(param: FailDeploymentStepParam): Promise<any> {
  return param;
}
