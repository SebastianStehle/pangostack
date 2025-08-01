import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import {
  IsArray,
  isBoolean,
  IsBoolean,
  IsDefined,
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
  allowedValues?: any[];

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
}

class UsageDefinitionClass {
  @IsDefined()
  @IsString()
  totalCpus: string;

  @IsDefined()
  @IsString()
  totalMemory: string;

  @IsDefined()
  @IsString()
  totalVolumeSize: string;

  @IsDefined()
  @IsString()
  totalStorage: string;
}

class ServiceDefinitionClass {
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

export type ParameterDefinition = InstanceType<typeof ParameterDefinitionClass>;
export type ResourceDefinition = InstanceType<typeof ResourceDefinitionClass>;
export type ResourcesDefinition = Pick<ServiceDefinition, 'resources'>;
export type ServiceDefinition = InstanceType<typeof ServiceDefinitionClass>;
export type UsageDefinition = InstanceType<typeof UsageDefinitionClass>;

export function definitionToYaml(definition: ServiceDefinition) {
  return stringify(definition);
}

export function yamlToDefinition(yaml: string): ServiceDefinition {
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

export function evaluateParameters(resource: ResourceDefinition, env: any, context: any) {
  const params = { ...resource.parameters };

  const expressionContext = { env, context, parameters: resource.parameters };
  for (const [key, value] of Object.entries(resource.parameters)) {
    params[key] = evaluateExpression(value, expressionContext);
  }

  return params;
}

export function validateDefinitionValue(service: ServiceDefinition, target: Record<string, any>) {
  const errors: ValidationError[] = [];

  for (const [key, definition] of Object.entries(service.parameters)) {
    const valueExists = key in target;
    const valueRaw = target[key];
    let value = valueRaw;

    const error: ValidationError = {
      property: `parameters.${key}`,
      constraints: {},
    };

    if (!valueExists && definition.required) {
      error.constraints['isDefined'] = 'Value is required but was not provided';
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
          error.constraints['isBoolean'] = 'Value must be a boolean';
        }
      } else if (definition.type === 'number') {
        if (typeof value === 'string' && !isNaN(+value)) {
          value = +value;
        }

        if (!isNumber(value)) {
          error.constraints['isNumber'] = 'Value must be a number';
        } else {
          if (definition.minValue && value < definition.minValue) {
            error.constraints['minValue'] = `Value must be at least ${definition.minValue}`;
          }
          if (definition.maxValue && value > definition.maxValue) {
            error.constraints['maxValue'] = `Value must be at most ${definition.maxValue}`;
          }
          if (definition.allowedValues && definition.allowedValues.indexOf(value) < 0) {
            error.constraints['enum'] = `Value must be at one of the allowed values`;
          }
        }
      } else if (definition.type === 'string') {
        if (!isString(value)) {
          error.constraints['isString'] = 'Value must be a string';
        } else {
          if (definition.minLength && value.length < definition.minLength) {
            error.constraints['minLength'] = `Value must be at least ${definition.minLength} characters long`;
          }
          if (definition.maxLength && value.length > definition.maxLength) {
            error.constraints['maxLength'] = `Value must be at most ${definition.maxLength} characters long`;
          }
          if (definition.allowedValues && definition.allowedValues.indexOf(value) < 0) {
            error.constraints['enum'] = `Value must be at one of the allowed values`;
          }
        }
      }
    }

    if (Object.keys(error.constraints).length > 0) {
      errors.push(error);
    }
  }

  if (errors.length > 0) {
    throw new BadRequestException(flattenValidationErrors(errors));
  }
}
