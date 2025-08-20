import { DeploymentEntity } from '../database';

export interface DeploymentPolicy {
  isAllowed(deployment: DeploymentEntity): boolean;
}

export class AllowAllDeploymentPolicy implements DeploymentPolicy {
  isAllowed(): boolean {
    return true;
  }
}

export class AllowTeamDeploymentPolicy implements DeploymentPolicy {
  constructor(private readonly teamIds: number[]) {}

  isAllowed(deployment: DeploymentEntity): boolean {
    return this.teamIds.indexOf(deployment.teamId) >= 0;
  }
}
