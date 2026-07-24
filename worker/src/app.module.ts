import { Module } from '@nestjs/common';
import { DeploymentController } from './controllers/deployment/deployment.controller';
import { PingController } from './controllers/ping/ping.controller';
import { ResourcesController } from './controllers/resources/resources.controller';
import { StatusController } from './controllers/status/status.controller';
import { AwsS3Resource } from './resources/aws-s3';
import { AwsVmResource } from './resources/aws-vm';
import { AzureBlobResource } from './resources/azure-blob';
import { AzureVmResource } from './resources/azure-vm';
import { DockerComposeSshResource } from './resources/docker-compose-ssh';
import { GcpStorageResource } from './resources/gcp-storage';
import { GcpVmResource } from './resources/gcp-vm';
import { HelmResource } from './resources/helm';
import { Resource, RESOURCES_TOKEN } from './resources/interface';
import { TerraformResource } from './resources/terraform';
import { VultrStorageResource } from './resources/vultr-storage';
import { VultrVmResource } from './resources/vultr-vm';

const RESOURCE_PROVIDERS = [
  DockerComposeSshResource,
  HelmResource,
  VultrVmResource,
  VultrStorageResource,
  AwsS3Resource,
  AwsVmResource,
  AzureBlobResource,
  AzureVmResource,
  GcpStorageResource,
  GcpVmResource,
  TerraformResource,
];

@Module({
  imports: [],
  controllers: [DeploymentController, PingController, ResourcesController, StatusController],
  providers: [
    ...RESOURCE_PROVIDERS,
    {
      provide: RESOURCES_TOKEN,
      useFactory: (...args: Resource[]) => {
        return new Map([...args].map((r) => [r.descriptor.name, r]));
      },
      inject: RESOURCE_PROVIDERS,
    },
  ],
})
export class AppModule {}
