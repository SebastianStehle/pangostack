import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDefined, IsNumber, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { Deployment, Service, ServicePublic, ServiceVersion } from 'src/domain/services';
import { ParameterDefinition } from 'src/domain/services/workflows/model';

export class CreateDeploymentDto {
  @ApiProperty({
    description: 'The optional name to describe the deployment.',
    nullable: true,
    maxLength: 100,
  })
  @IsOptional()
  @IsNumber()
  @MaxLength(100)
  name?: string;

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
    description: 'The optional name to describe the deployment.',
    nullable: true,
    maxLength: 100,
  })
  @IsOptional()
  @IsNumber()
  @MaxLength(100)
  name?: string;

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

  @ApiProperty({
    description: 'The version of the service.',
    required: true,
  })
  serviceVersion: string;

  @ApiProperty({
    description: 'The timestamp when the deployment has been created.',
    required: true,
    type: 'string',
    format: 'date',
  })
  createdAt: Date;

  static fromDomain(source: Deployment) {
    const result = new DeploymentDto();
    result.id = source.id;
    result.serviceId = source.serviceId;
    result.serviceName = source.serviceName;
    result.serviceVersion = source.serviceVersion;
    result.createdAt = source.createdAt;

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

export class UpsertServiceDto {
  @ApiProperty({
    description: 'The name of the service.',
    required: true,
    maxLength: 100,
  })
  @IsDefined()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'The description.',
    required: true,
  })
  @IsDefined()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The environment settings.',
    required: true,
    type: Object,
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject()
  environment?: Record<string, string>;

  @ApiProperty({
    description: 'The currency.',
    required: true,
  })
  @IsDefined()
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'The price per CPU and hour in the selected currency.',
    required: true,
  })
  @IsDefined()
  @IsNumber()
  pricePerCpuHour: number;

  @ApiProperty({
    description: 'The price per Memory in GB and hour in the selected currency.',
    required: true,
  })
  @IsDefined()
  @IsNumber()
  pricePerMemoryGbHour: number;

  @ApiProperty({
    description: 'The price per Storage in GB and hour in the selected currency.',
    required: true,
  })
  @IsDefined()
  @IsNumber()
  pricePerStorageGbMonth: number;

  @ApiProperty({
    description: 'The price per Disk in GB and hour in the selected currency.',
    required: true,
  })
  @IsDefined()
  @IsNumber()
  pricePerVolumeGbHour: number;

  @ApiProperty({
    description: 'The additional fixed price.',
    required: true,
  })
  @IsDefined()
  @IsNumber()
  fixedPrice: number;

  @ApiProperty({
    description: 'Indicates if the service is public.',
    required: true,
  })
  @IsDefined()
  @IsBoolean()
  isPublic: boolean;
}

export class ServiceDto {
  @ApiProperty({
    description: 'The ID of the service.',
    required: true,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the service.',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'The description.',
    required: true,
  })
  description: string;

  @ApiProperty({
    description: 'The number of deployments.',
    required: true,
  })
  numDeployments: number;

  @ApiProperty({
    description: 'The latest version.',
    required: false,
  })
  latestVersion?: string;

  @ApiProperty({
    description: 'The environment settings.',
    required: true,
    type: Object,
    additionalProperties: { type: 'string' },
  })
  environment: Record<string, string>;

  @ApiProperty({
    description: 'The currency.',
    required: true,
  })
  currency: string;

  @ApiProperty({
    description: 'The price per CPU and hour in the selected currency.',
    required: true,
  })
  pricePerCpuHour: number;

  @ApiProperty({
    description: 'The price per Memory in GB and hour in the selected currency.',
    required: true,
  })
  pricePerMemoryGbHour: number;

  @ApiProperty({
    description: 'The price per Storage in GB and hour in the selected currency.',
    required: true,
  })
  pricePerStorageGbMonth: number;

  @ApiProperty({
    description: 'The price per Disk in GB and hour in the selected currency.',
    required: true,
  })
  pricePerVolumeGbHour: number;

  @ApiProperty({
    description: 'The additional fixed price.',
    required: true,
  })
  fixedPrice: number;

  @ApiProperty({
    description: 'Indicates if the service is active (has at least one active version).',
    required: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Indicates if the service is public.',
    required: true,
  })
  isPublic: boolean;

  static fromDomain(source: Service): ServiceDto {
    const result = new ServiceDto();
    result.id = source.id;
    result.currency = source.currency;
    result.description = source.description;
    result.environment = source.environment;
    result.fixedPrice = source.fixedPrice;
    result.isActive = source.isActive;
    result.isPublic = source.isPublic;
    result.latestVersion = source.latestVersion;
    result.name = source.name;
    result.numDeployments = source.numDeployments;
    result.pricePerCpuHour = source.pricePerCpuHour;
    result.pricePerVolumeGbHour = source.pricePerVolumeGbHour;
    result.pricePerMemoryGbHour = source.pricePerMemoryGbHour;
    result.pricePerStorageGbMonth = source.pricePerStorageGbMonth;
    return result;
  }
}

export class ServicesDto {
  @ApiProperty({
    description: 'The services.',
    required: true,
    type: [ServiceDto],
  })
  items: ServiceDto[];

  static fromDomain(source: Service[]): ServicesDto {
    const result = new ServicesDto();
    result.items = source.map(ServiceDto.fromDomain);
    return result;
  }
}

export class CreateServiceVersionDto {
  @ApiProperty({
    description: 'The name of the version.',
    required: true,
    maxLength: 10,
  })
  @IsDefined()
  @IsString()
  @MaxLength(10)
  name: string;

  @ApiProperty({
    description: 'The YAML definition.',
    required: true,
  })
  @IsDefined()
  @IsString()
  definition: string;

  @ApiProperty({
    description: 'The environment settings.',
    required: true,
    type: Object,
    additionalProperties: { type: 'string' },
  })
  @IsDefined()
  @IsObject()
  environment: Record<string, string>;

  @ApiProperty({
    description: 'Indicates if the version is active.',
    required: true,
  })
  @IsDefined()
  @IsBoolean()
  isActive: boolean;
}

export class UpdateServiceVersionDto {
  @ApiProperty({
    description: 'The YAML definition.',
    required: true,
  })
  @IsOptional()
  @IsString()
  definition?: string;

  @ApiProperty({
    description: 'The environment settings.',
    required: true,
    type: Object,
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject()
  environment?: Record<string, string>;

  @ApiProperty({
    description: 'Indicates if the version is active.',
    required: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ServiceVersionDto {
  @ApiProperty({
    description: 'The ID of the service version.',
    required: true,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the version.',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'The YAML definition.',
    required: true,
  })
  definition: string;

  @ApiProperty({
    description: 'The environment settings.',
    required: true,
    type: Object,
    additionalProperties: { type: 'string' },
  })
  environment: Record<string, string>;

  @ApiProperty({
    description: 'Indicates if the version is active.',
    required: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Indicates if the version is the default one.',
    required: true,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'The number of deployments.',
    required: true,
  })
  numDeployments: number;

  static fromDomain(source: ServiceVersion): ServiceVersionDto {
    const result = new ServiceVersionDto();
    result.id = source.id;
    result.definition = source.definition;
    result.environment = source.environment;
    result.isActive = source.isActive;
    result.isDefault = source.isDefault;
    result.name = source.name;
    result.numDeployments = source.numDeployments;
    return result;
  }
}

export class ServiceVersionsDto {
  @ApiProperty({
    description: 'The service versions.',
    required: true,
    type: [ServiceVersionDto],
  })
  items: ServiceVersionDto[];

  static fromDomain(source: ServiceVersion[]): ServiceVersionsDto {
    const result = new ServiceVersionsDto();
    result.items = source.map(ServiceVersionDto.fromDomain);
    return result;
  }
}

export class ParameterDefinitionDto {
  @ApiProperty({
    description: 'The name of the parameter.',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'The type of the parameter.',
    enum: ['string', 'number', 'boolean'],
    required: true,
  })
  type: 'string' | 'number' | 'boolean';

  @ApiProperty({
    description: 'Indicates if the parameter is required.',
    required: true,
  })
  required: boolean;

  @ApiProperty({
    description: 'Gives the parameter a readable name.',
    required: false,
  })
  label?: string;

  @ApiProperty({
    description: 'Describes the parameter.',
    required: false,
  })
  hint?: string;

  @ApiProperty({
    description: 'The default value of the parameter.',
    required: false,
  })
  defaultValue?: any;

  @ApiProperty({
    description: 'Allowed values for the parameter.',
    required: false,
    type: [Object],
  })
  allowedValues?: any[];

  @ApiProperty({
    description: 'Minimum value for numeric parameters.',
    required: false,
  })
  minValue?: number;

  @ApiProperty({
    description: 'Maximum value for numeric parameters.',
    required: false,
  })
  maxValue?: number;

  @ApiProperty({
    description: 'Minimum length for string parameters.',
    required: false,
  })
  minLength?: number;

  @ApiProperty({
    description: 'The step when the control is a slider.',
    required: false,
  })
  step?: number;

  @ApiProperty({
    description: 'Maximum length for string parameters.',
    required: false,
  })
  maxLength?: number;

  @ApiProperty({
    description: 'Optional section for grouping.',
    required: false,
  })
  section?: string;

  static fromDomain(source: ParameterDefinition): ParameterDefinitionDto {
    const result = new ParameterDefinitionDto();
    result.name = source.name;
    result.allowedValues = source.allowedValues;
    result.defaultValue = source.defaultValue;
    result.label = source.label;
    result.maxLength = source.maxLength;
    result.maxValue = source.maxValue;
    result.minLength = source.minLength;
    result.minValue = source.minValue;
    result.required = source.required;
    result.section = source.section;
    result.step = source.step;
    result.type = source.type;
    return result;
  }
}

export class ServicePublicDto {
  @ApiProperty({
    description: 'The ID of the service.',
    required: true,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the service.',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'The description.',
    required: true,
  })
  description: string;

  @ApiProperty({
    description: 'The latest version.',
    required: true,
  })
  version: string;

  @ApiProperty({
    description: 'The currency.',
    required: true,
  })
  currency: string;

  @ApiProperty({
    description: 'The price per CPU and hour in the selected currency.',
    required: true,
  })
  pricePerCpuHour: number;

  @ApiProperty({
    description: 'The price per Memory in GB and hour in the selected currency.',
    required: true,
  })
  pricePerMemoryGbHour: number;

  @ApiProperty({
    description: 'The price per Storage in GB and hour in the selected currency.',
    required: true,
  })
  pricePerStorageGbMonth: number;

  @ApiProperty({
    description: 'The price per Disk in GB and hour in the selected currency.',
    required: true,
  })
  pricePerVolumeGbHour: number;

  @ApiProperty({
    description: 'The additional fixed price.',
    required: true,
  })
  fixedPrice: number;

  @ApiProperty({
    description: 'The parameters.',
    required: true,
    type: [ParameterDefinitionDto],
  })
  parameters: ParameterDefinitionDto[];

  @ApiProperty({
    description: 'The expression to calculate the total number of CPUs.',
    required: true,
  })
  totalCpus: string;

  @ApiProperty({
    description: 'The expression to calculate the total memory.',
    required: true,
  })
  totalMemory: string;

  @ApiProperty({
    description: 'The expression to calculate the total volume size.',
    required: true,
  })
  totalVolumeSize: string;

  @ApiProperty({
    description: 'The expression to calculate the total storage.',
    required: true,
  })
  totalStorage: string;

  static fromDomain(source: ServicePublic): ServicePublicDto {
    const result = new ServicePublicDto();
    result.id = source.id;
    result.currency = source.currency;
    result.description = source.description;
    result.fixedPrice = source.fixedPrice;
    result.name = source.name;
    result.parameters = source.parameters.map(ParameterDefinitionDto.fromDomain);
    result.pricePerCpuHour = source.pricePerCpuHour;
    result.pricePerVolumeGbHour = source.pricePerVolumeGbHour;
    result.pricePerMemoryGbHour = source.pricePerMemoryGbHour;
    result.pricePerStorageGbMonth = source.pricePerStorageGbMonth;
    result.totalCpus = source.usage.totalCpus;
    result.totalMemory = source.usage.totalMemory;
    result.totalStorage = source.usage.totalStorage;
    result.totalVolumeSize = source.usage.totalVolumeSize;
    result.version = source.version;
    return result;
  }
}

export class ServicesPublicDto {
  @ApiProperty({
    description: 'The list of public services.',
    required: true,
    type: [ServicePublicDto],
  })
  items: ServicePublicDto[];

  static fromDomain(source: ServicePublic[]): ServicesPublicDto {
    const result = new ServicesPublicDto();
    result.items = source.map(ServicePublicDto.fromDomain);
    return result;
  }
}
