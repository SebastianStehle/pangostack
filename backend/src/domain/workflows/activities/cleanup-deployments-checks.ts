import { InjectRepository } from '@nestjs/typeorm';
import { addDays } from 'date-fns';
import { LessThan } from 'typeorm';
import { DeploymentCheckEntity, DeploymentCheckRepository } from 'src/domain/database';
import { Activity } from '../registration';

export type CleanupDeploymentChecksParams = { maxDays: number };

@Activity(cleanupDeploymentsChecks)
export class CleanupDeploymentsChecksActivity implements Activity<CleanupDeploymentChecksParams, any> {
  constructor(
    @InjectRepository(DeploymentCheckEntity)
    private readonly deploymentChecks: DeploymentCheckRepository,
  ) {}

  async execute({ maxDays }: CleanupDeploymentChecksParams) {
    const maxAge = addDays(new Date(), -maxDays);

    await this.deploymentChecks.delete({ createdAt: LessThan(maxAge) });
  }
}

export async function cleanupDeploymentsChecks(param: CleanupDeploymentChecksParams): Promise<any> {
  return param;
}
