import { InjectRepository } from '@nestjs/typeorm';
import { addDays, format } from 'date-fns';
import { LessThan } from 'typeorm';
import { DeploymentUsageEntity, DeploymentUsageRepository } from 'src/domain/database';
import { Activity } from '../registration';

export type CleanupDeploymentUsagesParams = { maxDays: number };

@Activity(cleanupDeploymentsUsages)
export class CleanupDeploymentUsagesActivity implements Activity<CleanupDeploymentUsagesParams, any> {
  constructor(
    @InjectRepository(DeploymentUsageEntity)
    private readonly deploymentUsages: DeploymentUsageRepository,
  ) {}

  async execute({ maxDays }: CleanupDeploymentUsagesParams) {
    const maxAge = format(addDays(new Date(), -maxDays), 'yyyy-MM-dd');

    await this.deploymentUsages.delete({ trackDate: LessThan(maxAge) });
  }
}

export async function cleanupDeploymentsUsages(param: CleanupDeploymentUsagesParams): Promise<any> {
  return param;
}
