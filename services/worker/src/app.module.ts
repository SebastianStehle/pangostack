import { Module } from '@nestjs/common';
import { DeploymentController } from './controllers/deployment/deployment.controller';
import { StatusController } from './controllers/status/status.controller';
import { HelmResource } from './resources/helm';
import { Resource, RESOURCE_TOKEN } from './resources/interface';
import { VultrStorageResource } from './resources/vultr-storage';

@Module({
  imports: [],
  controllers: [DeploymentController, StatusController],
  providers: [
    HelmResource,
    VultrStorageResource,
    {
      provide: RESOURCE_TOKEN,
      useFactory: (...args: Resource[]) => {
        return [...args];
      },
      inject: [VultrStorageResource, HelmResource],
    },
  ],
})
export class AppModule {}
