import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentRepository } from 'src/domain/database';

export class CancelDeployment {
  constructor(
    public readonly teamId: number,
    public readonly deploymentId: number,
    public readonly token: string,
  ) {}
}

@CommandHandler(CancelDeployment)
export class CancelDeploymentHandler implements ICommandHandler<CancelDeployment> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
  ) {}

  async execute(command: CancelDeployment): Promise<any> {
    const { deploymentId, teamId, token } = command;

    const deployment = await this.deployments.findOne({
      where: { id: deploymentId, teamId },
      relations: ['version', 'version.service'],
    });
    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    if (deployment.status !== 'Created' || deployment.confirmToken !== token) {
      throw new ForbiddenException();
    }

    await this.deployments.delete({ id: deploymentId });
  }
}
