import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDefined, IsNumber, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { definitionToYaml, ParameterAllowedvalue, ParameterDefinition, ServicePricingModel } from 'src/domain/definitions';
import { Service, ServicePrice, ServicePublic, ServiceVersion } from 'src/domain/services';

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
    description: 'The price per Core and hour in the selected currency.',
    required: true,
  })
  @IsDefined()
  @IsNumber()
  pricePerCoreHour: number;

  @ApiProperty({
    description: 'The price per Memory in GB and hour in the selected currency.',
    required: true,
  })
  @IsDefined()
  @IsNumber()
  pricePerMemoryGBHour: number;

  @ApiProperty({
    description: 'The price per Storage in GB and hour in the selected currency.',
    required: true,
  })
  @IsDefined()
  @IsNumber()
  pricePerStorageGBMonth: number;

  @ApiProperty({
    description: 'The price per Disk in GB and hour in the selected currency.',
    required: true,
  })
  @IsDefined()
  @IsNumber()
  pricePerVolumeGBHour: number;

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
    nullable: true,
    type: String,
  })
  latestVersion?: string | null;

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
    description: 'The price per Core and hour in the selected currency.',
    required: true,
  })
  pricePerCoreHour: number;

  @ApiProperty({
    description: 'The price per Memory in GB and hour in the selected currency.',
    required: true,
  })
  pricePerMemoryGBHour: number;

  @ApiProperty({
    description: 'The price per Disk in GB and hour in the selected currency.',
    required: true,
  })
  pricePerVolumeGBHour: number;

  @ApiProperty({
    description: 'The price per Storage in GB and month in the selected currency.',
    required: true,
  })
  pricePerStorageGBMonth: number;

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
    result.environment = source.environment || {};
    result.fixedPrice = source.fixedPrice;
    result.isActive = source.isActive;
    result.isPublic = source.isPublic;
    result.latestVersion = source.latestVersion;
    result.name = source.name;
    result.numDeployments = source.numDeployments;
    result.pricePerCoreHour = source.pricePerCoreHour;
    result.pricePerVolumeGBHour = source.pricePerVolumeGBHour;
    result.pricePerMemoryGBHour = source.pricePerMemoryGBHour;
    result.pricePerStorageGBMonth = source.pricePerStorageGBMonth;
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
    result.definition = definitionToYaml(source.definition);
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

class ParameterAllowedvalueDto {
  @ApiProperty({
    description: 'The value.',
    required: true,
  })
  value: any;

  @ApiProperty({
    description: 'The display label.',
    required: true,
  })
  label: string;

  @ApiProperty({
    description: 'The hints to explain the value.',
    nullable: true,
    type: String,
  })
  hint?: string | null;

  static fromDomain(source: ParameterAllowedvalue): ParameterAllowedvalueDto {
    const result = new ParameterAllowedvalueDto();
    result.value = source.value;
    result.label = source.label;
    result.hint = source.hint;
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
    description: 'Indicates if the parameter cannot be changed after creation.',
    nullable: true,
  })
  immutable?: boolean | null;

  @ApiProperty({
    description: 'Indicates if the parameter should be displayed.',
    nullable: true,
  })
  display?: boolean | null;

  @ApiProperty({
    description: 'Gives the parameter a readable name.',
    nullable: true,
    type: String,
  })
  label?: string | null;

  @ApiProperty({
    description: 'Describes the parameter.',
    nullable: true,
    type: String,
  })
  hint?: string | null;

  @ApiProperty({
    description: 'The default value of the parameter.',
    nullable: true,
  })
  defaultValue?: any | null;

  @ApiProperty({
    description: 'Allowed values for the parameter.',
    nullable: true,
    type: [ParameterAllowedvalueDto],
  })
  allowedValues?: ParameterAllowedvalueDto[] | null;

  @ApiProperty({
    description: 'Minimum value for numeric parameters.',
    nullable: true,
    type: Number,
  })
  minValue?: number | null;

  @ApiProperty({
    description: 'Maximum value for numeric parameters.',
    nullable: true,
    type: Number,
  })
  maxValue?: number | null;

  @ApiProperty({
    description: 'Minimum length for string parameters.',
    nullable: true,
    type: Number,
  })
  minLength?: number | null;

  @ApiProperty({
    description: 'The step when the control is a slider.',
    nullable: true,
    type: Number,
  })
  step?: number | null;

  @ApiProperty({
    description: 'Maximum length for string parameters.',
    nullable: true,
    type: Number,
  })
  maxLength?: number | null;

  @ApiProperty({
    description: 'Optional section for grouping.',
    nullable: true,
    type: Number,
  })
  section?: string | null;

  static fromDomain(source: ParameterDefinition): ParameterDefinitionDto {
    const result = new ParameterDefinitionDto();
    result.allowedValues = source.allowedValues?.map(ParameterAllowedvalueDto.fromDomain) || null;
    result.defaultValue = source.defaultValue;
    result.display = source.display;
    result.immutable = source.immutable;
    result.label = source.label;
    result.maxLength = source.maxLength;
    result.maxValue = source.maxValue;
    result.minLength = source.minLength;
    result.minValue = source.minValue;
    result.name = source.name;
    result.required = source.required;
    result.section = source.section;
    result.step = source.step;
    result.type = source.type;
    return result;
  }
}

export class ServicePriceDto {
  @ApiProperty({
    description: 'The target value.',
    required: true,
  })
  target: string;

  @ApiProperty({
    description: 'The test value.',
    required: true,
  })
  test: string;

  @ApiProperty({
    description: 'The total amount in the currency of the service.',
    required: true,
  })
  amount: number;

  static fromDomain(source: ServicePrice): ServicePriceDto {
    const result = new ServicePriceDto();
    result.target = source.target;
    result.test = source.test;
    result.amount = source.amount;
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
    description: 'The price per Core and hour in the selected currency.',
    required: true,
  })
  pricePerCoreHour: number;

  @ApiProperty({
    description: 'The price per Memory in GB and hour in the selected currency.',
    required: true,
  })
  pricePerMemoryGBHour: number;

  @ApiProperty({
    description: 'The price per Storage in GB and hour in the selected currency.',
    required: true,
  })
  pricePerStorageGBMonth: number;

  @ApiProperty({
    description: 'The price per Disk in GB and hour in the selected currency.',
    required: true,
  })
  pricePerVolumeGBHour: number;

  @ApiProperty({
    description: 'The additional fixed price.',
    required: true,
  })
  fixedPrice: number;

  @ApiProperty({
    description: 'The prices.',
    required: true,
    type: [ServicePriceDto],
  })
  prices?: ServicePriceDto[];

  @ApiProperty({
    description: 'The pricing model.',
    required: true,
    enum: ['fixed', 'pay_per_use'],
  })
  pricingModel: ServicePricingModel;

  @ApiProperty({
    description: 'The parameters.',
    required: true,
    type: [ParameterDefinitionDto],
  })
  parameters: ParameterDefinitionDto[];

  @ApiProperty({
    description: 'The instructions to show after the installation has been made.',
    nullable: true,
    type: String,
  })
  afterInstallationInstructions?: string | null;

  @ApiProperty({
    description: 'The expression to calculate the total number of Core.',
    required: true,
  })
  totalCores: string;

  @ApiProperty({
    description: 'The expression to calculate the total memory.',
    required: true,
  })
  totalMemoryGB: string;

  @ApiProperty({
    description: 'The expression to calculate the total volume size.',
    required: true,
  })
  totalVolumeGB: string;

  @ApiProperty({
    description: 'The expression to calculate the total storage.',
    required: true,
  })
  totalStorageGB: string;

  static fromDomain(source: ServicePublic): ServicePublicDto {
    const result = new ServicePublicDto();
    result.id = source.id;
    result.afterInstallationInstructions = source.afterInstallationInstructions;
    result.currency = source.currency;
    result.description = source.description;
    result.fixedPrice = source.fixedPrice;
    result.name = source.name;
    result.parameters = source.parameters.map(ParameterDefinitionDto.fromDomain);
    result.pricePerCoreHour = source.pricePerCoreHour;
    result.pricePerMemoryGBHour = source.pricePerMemoryGBHour;
    result.pricePerStorageGBMonth = source.pricePerStorageGBMonth;
    result.pricePerVolumeGBHour = source.pricePerVolumeGBHour;
    result.prices = source.prices?.map(ServicePriceDto.fromDomain) || [];
    result.pricingModel = source.pricingModel;
    result.totalCores = source.usage.totalCores;
    result.totalMemoryGB = source.usage.totalMemoryGB;
    result.totalVolumeGB = source.usage.totalVolumeGB;
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
