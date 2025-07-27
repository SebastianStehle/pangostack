import { DeploymentEntity, ServiceEntity } from 'src/domain/database';
import { Deployment } from '../interfaces';

export function buildDeployment(source: DeploymentEntity, service: ServiceEntity): Deployment {
  return {
    id: source.id,
    serviceName: service.name,
    serviceId: service.id,
  };
}
