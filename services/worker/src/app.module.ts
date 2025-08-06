import { Module } from '@nestjs/common';
import { DeploymentController } from './controllers/deployment/deployment.controller';
import { ResourcesController } from './controllers/resources/resources.controller';
import { StatusController } from './controllers/status/status.controller';
import { HelmResource } from './resources/helm';
import { Resource, RESOURCES_TOKEN } from './resources/interface';
import { VultrDockerResource } from './resources/vultr-docker';
import { VultrStorageResource } from './resources/vultr-storage';

@Module({
  imports: [],
  controllers: [DeploymentController, ResourcesController, StatusController],
  providers: [
    HelmResource,
    VultrDockerResource,
    VultrStorageResource,
    {
      provide: RESOURCES_TOKEN,
      useFactory: (...args: Resource[]) => {
        return new Map([...args].map((r) => [r.descriptor.name, r]));
      },
      inject: [VultrDockerResource, VultrStorageResource, HelmResource],
    },
  ],
})
export class AppModule {}
