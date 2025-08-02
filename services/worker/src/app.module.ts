import { Module } from '@nestjs/common';
import { DeploymentController } from './controllers/deployment/deployment.controller';
import { StatusController } from './controllers/status/status.controller';
import { HelmResource } from './resources/helm';
import { Resource, RESOURCES_TOKEN } from './resources/interface';
import { VultrStorageResource } from './resources/vultr-storage';

@Module({
  imports: [],
  controllers: [DeploymentController, StatusController],
  providers: [
    HelmResource,
    VultrStorageResource,
    {
      provide: RESOURCES_TOKEN,
      useFactory: (...args: Resource[]) => {
        return new Map([...args].map((r) => [r.descriptor.name, r]));
      },
      inject: [VultrStorageResource, HelmResource],
    },
  ],
})
export class AppModule {}
