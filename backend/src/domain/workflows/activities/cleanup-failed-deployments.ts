import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays } from 'date-fns';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { DeploymentEntity, DeploymentRepository, DeploymentUpdateEntity } from 'src/domain/database';
import { Activity } from '../registration';

export type CleanupFailedDeploymentsParams = { maxDays: number };

@Activity(cleanupFailedDeployments)
export class CleanupFailedDeployments implements Activity<CleanupFailedDeploymentsParams, any> {
  private readonly logger = new Logger(CleanupFailedDeployments.name);

  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
  ) {}

  async execute({ maxDays }: CleanupFailedDeploymentsParams) {
    const maxAge = addDays(new Date(), -maxDays);

    const deploymentsToDelete = await this.deployments
      .createQueryBuilder('deployment')
      .select('deployment.id', 'id')
      .where('deployment.createdAt < :maxAge', { maxAge })
      .andWhere(
        new Brackets((qb) => {
          qb.where('deployment.status = :status', { status: 'Pending' });
          qb.orWhere((qb2: SelectQueryBuilder<DeploymentUpdateEntity>) => {
            const subQuery = qb2
              .subQuery()
              .select('1')
              .from('deployment-updates', 'update')
              .where('update.deploymentId = deployment.id')
              .andWhere("update.status = 'Completed'")
              .getQuery();

            return `NOT EXISTS ${subQuery}`;
          });
        }),
      )
      .getRawMany<{ id: number }>();

    for (const id of deploymentsToDelete) {
      this.logger.log(`Deleting deployment ${id}`);
      await this.deployments.delete(id);
    }
  }
}

export async function cleanupFailedDeployments(param: CleanupFailedDeploymentsParams): Promise<any> {
  return param;
}
