import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import {
  IsArray,
  isBoolean,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsIn,
  isNumber,
  IsNumber,
  IsObject,
  IsOptional,
  isString,
  IsString,
  Min,
  validate,
  ValidateNested,
  ValidationError,
} from 'class-validator';
import { parse, stringify, YAMLError } from 'yaml';
import { evaluateExpression, flattenValidationErrors, is } from 'src/lib';

class ParameterDefinitionClass {
  @IsDefined()
  @IsString()
  name: string;

  @IsDefined()
  @IsIn(['string', 'number', 'boolean'])
  type: 'string' | 'number' | 'boolean';

  @IsDefined()
  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  hint?: string;

  @IsOptional()
  @IsNumber()
  defaultValue?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterAllowedvalueClass)
  allowedValues?: ParameterAllowedvalueClass[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minValue?: number;

  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @IsOptional()
  @IsNumber()
  step?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minLength?: number;

  @IsOptional()
  @IsNumber()
  maxLength?: number;

  @IsOptional()
  @IsString()
  section?: string;
}

class ParameterAllowedvalueClass {
  @IsDefined()
  @IsString()
  value: any;

  @IsDefined()
  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  hint?: string;
}

class ResourceHealtCheckClass {
  @IsDefined()
  @IsString()
  name: string;

  @IsDefined()
  @IsString()
  url: string;

  @IsDefined()
  @IsEnum(['http'])
  type: 'http';
}

class ResourceMappingClass {
  @IsDefined()
  @IsString()
  value: string;

  @IsDefined()
  @IsObject()
  map: Record<string, string>;
}

class ResourceDefinitionClass {
  @IsDefined()
  @IsString()
  name: string;

  @IsDefined()
  @IsString()
  id: string;

  @IsDefined()
  @IsString()
  type: string;

  @IsDefined()
  @IsObject()
  parameters: Record<string, string>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceHealtCheckClass)
  healthChecks?: ResourceHealtCheckClass[];

  @IsDefined()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => ResourceMappingClass)
  mappings: Record<string, ResourceMappingClass>;
}

class UsageDefinitionClass {
  @IsDefined()
  @IsString()
  totalCores: string;

  @IsDefined()
  @IsString()
  totalMemoryGB: string;

  @IsDefined()
  @IsString()
  totalVolumeGB: string;
}

class ServiceDefinitionClass {
  @IsOptional()
  @IsString()
  afterInstallationInstruction?: string;

  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterDefinitionClass)
  parameters: ParameterDefinitionClass[];

  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceDefinitionClass)
  resources: ResourceDefinitionClass[];

  @IsDefined()
  @ValidateNested()
  @Type(() => UsageDefinitionClass)
  usage: UsageDefinitionClass;
}

export type ParameterAllowedvalue = InstanceType<typeof ParameterAllowedvalueClass>;
export type ParameterDefinition = InstanceType<typeof ParameterDefinitionClass>;
export type ResourceDefinition = InstanceType<typeof ResourceDefinitionClass>;
export type ResourceHealtCheck = InstanceType<typeof ResourceHealtCheckClass>;
export type ResourceMapping = InstanceType<typeof ResourceMappingClass>;
export type ResourcesDefinition = Pick<ServiceDefinition, 'resources'>;
export type ServiceDefinition = InstanceType<typeof ServiceDefinitionClass>;
export type UsageDefinition = InstanceType<typeof UsageDefinitionClass>;

export function definitionToYaml(definition: ServiceDefinition) {
  return stringify(definition);
}

export function yamlToDefinition(yaml: string | undefined | null): ServiceDefinition {
  if (!yaml) {
    return new ServiceDefinitionClass();
  }

  try {
    const definitionJson = parse(yaml);
    const definitionClass = plainToInstance(ServiceDefinitionClass, definitionJson);

    if (!is(definitionClass, ResourceDefinitionClass)) {
      return new ServiceDefinitionClass();
    }

    return definitionClass;
  } catch (ex: any) {
    if (is(ex, YAMLError)) {
      throw new BadRequestException([ex.message]);
    } else {
      throw ex;
    }
  }
}

export async function validateDefinition(service: ServiceDefinition) {
  const errors = await validate(service);

  if (errors.length > 0) {
    throw new BadRequestException(flattenValidationErrors(errors));
  }
}

type DefinitionContext = { env: any; context: any; parameters: any };

export function evaluateHealthChecks(resource: ResourceDefinition, context: DefinitionContext): ResourceHealtCheck[] {
  if (!resource.healthChecks || resource.healthChecks.length === 0) {
    return [];
  }

  return resource.healthChecks.map((healthCheck) => {
    const cloned: ResourceHealtCheck = { ...healthCheck };

    cloned.url = evaluateExpression(cloned.url, context);
    return cloned;
  });
}

export function evaluateParameters(resource: ResourceDefinition, context: DefinitionContext) {
  const params = { ...resource.parameters };

  for (const [key, value] of Object.entries(resource.parameters)) {
    params[key] = evaluateExpression(value, context);
  }

  if (resource.mappings) {
    for (const [key, mapping] of Object.entries(resource.mappings)) {
      const value = evaluateExpression(mapping.value, context);

      const mapped = mapping.map[value];
      if (mapped) {
        params[key] = mapped;
      }
    }
  }

  return params;
}

export function evaluateUsage(service: ServiceDefinition, context: DefinitionContext) {
  const evaluate = (expression: string) => {
    const result = evaluateExpression(expression, context);
    const parsed = parseInt(result, 10);
    if (isNaN(parsed)) {
      return 0;
    }

    return parsed;
  };

  const totalCores = evaluate(service.usage.totalCores);
  const totalMemoryGB = evaluate(service.usage.totalMemoryGB);
  const totalVolumeGB = evaluate(service.usage.totalVolumeGB);

  return { totalCores, totalMemoryGB, totalVolumeGB };
}

export function validateDefinitionValue(service: ServiceDefinition, target: Record<string, any>) {
  const errors: ValidationError[] = [];

  for (const [key, definition] of Object.entries(service.parameters)) {
    const valueExists = key in target;
    const valueRaw = target[key];
    let value = valueRaw;

    const constraints: Record<string, any> = {};
    const error: ValidationError = {
      property: `parameters.${key}`,
      constraints,
    };

    if (!valueExists && definition.required) {
      constraints!['isDefined'] = 'Value is required but was not provided';
    }

    if (valueExists) {
      if (definition.type === 'boolean') {
        if (typeof value === 'string') {
          const valLower = value.toLowerCase();
          if (valLower === 'true' || valLower === '1') {
            value = true;
          } else if (valLower === 'false' || valLower === '0') {
            value = false;
          }
        } else if (typeof value === 'number') {
          if (value === 1) {
            value = true;
          } else if (value === 0) {
            value = false;
          }
        }

        if (!isBoolean(value)) {
          constraints['isBoolean'] = 'Value must be a boolean';
        }
      } else if (definition.type === 'number') {
        if (typeof value === 'string' && !isNaN(+value)) {
          value = +value;
        }

        if (!isNumber(value)) {
          constraints['isNumber'] = 'Value must be a number';
        } else {
          if (definition.minValue && value < definition.minValue) {
            constraints['minValue'] = `Value must be at least ${definition.minValue}`;
          }
          if (definition.maxValue && value > definition.maxValue) {
            constraints['maxValue'] = `Value must be at most ${definition.maxValue}`;
          }
          if (definition.allowedValues && !definition.allowedValues.find((x) => x.value === value)) {
            constraints['enum'] = `Value must be at one of the allowed values`;
          }
        }
      } else if (definition.type === 'string') {
        if (!isString(value)) {
          constraints['isString'] = 'Value must be a string';
        } else {
          if (definition.minLength && value.length < definition.minLength) {
            constraints['minLength'] = `Value must be at least ${definition.minLength} characters long`;
          }
          if (definition.maxLength && value.length > definition.maxLength) {
            constraints['maxLength'] = `Value must be at most ${definition.maxLength} characters long`;
          }
          if (definition.allowedValues && !definition.allowedValues.find((x) => x.value === value)) {
            constraints['enum'] = `Value must be at one of the allowed values`;
          }
        }
      }
    }

    if (Object.keys(constraints).length > 0) {
      errors.push(error);
    }
  }

  if (errors.length > 0) {
    throw new BadRequestException(flattenValidationErrors(errors));
  }
}
