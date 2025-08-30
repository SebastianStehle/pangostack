import { Module } from '@nestjs/common';
import { DeploymentController } from './controllers/deployment/deployment.controller';
import { ResourcesController } from './controllers/resources/resources.controller';
import { StatusController } from './controllers/status/status.controller';
import { DockerComposeSshResource } from './resources/docker-compose-ssh';
import { HelmResource } from './resources/helm';
import { Resource, RESOURCES_TOKEN } from './resources/interface';
import { VultrStorageResource } from './resources/vultr-storage';
import { VultrVmResource } from './resources/vultr-vm';

@Module({
  imports: [],
  controllers: [DeploymentController, ResourcesController, StatusController],
  providers: [
    DockerComposeSshResource,
    HelmResource,
    VultrVmResource,
    VultrStorageResource,
    {
      provide: RESOURCES_TOKEN,
      useFactory: (...args: Resource[]) => {
        return new Map([...args].map((r) => [r.descriptor.name, r]));
      },
      inject: [DockerComposeSshResource, HelmResource, VultrVmResource, VultrStorageResource],
    },
  ],
})
export class AppModule {}
