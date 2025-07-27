import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNumber, IsObject, IsOptional } from 'class-validator';
import { Deployment } from 'src/domain/services';

export class CreateDeploymentDto {
  @ApiProperty({
    description: 'The ID of the service.',
    required: true,
  })
  @IsDefined()
  @IsNumber()
  serviceId: number;

  @ApiProperty({
    description: 'The parameters.',
    required: true,
    additionalProperties: true,
  })
  @IsDefined()
  @IsObject()
  parameters: Record<string, any>;
}

export class UpdateDeploymentDto {
  @ApiProperty({
    description: 'The ID of the version when an update is made.',
    required: true,
  })
  @IsOptional()
  @IsNumber()
  versionId?: number;

  @ApiProperty({
    description: 'The parameters.',
    required: true,
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}

export class DeploymentDto {
  @ApiProperty({
    description: 'The ID of the deployment.',
    required: true,
  })
  id: number;

  @ApiProperty({
    description: 'The ID of the service.',
    required: true,
  })
  serviceId: number;

  @ApiProperty({
    description: 'The name of the service.',
    required: true,
  })
  serviceName: string;

  static fromDomain(source: Deployment) {
    const result = new DeploymentDto();
    result.id = source.id;
    result.serviceId = source.serviceId;
    result.serviceName = source.serviceName;

    return result;
  }
}

export class DeploymentsDto {
  @ApiProperty({
    description: 'The deployments.',
    required: true,
    type: [DeploymentDto],
  })
  items: DeploymentDto[];

  static fromDomain(source: Deployment[]) {
    const result = new DeploymentsDto();
    result.items = source.map(DeploymentDto.fromDomain);

    return result;
  }
}
