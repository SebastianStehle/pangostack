import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import {
  IsArray,
  isBoolean,
  IsBoolean,
  IsIn,
  isNumber,
  IsNumber,
  IsObject,
  IsOptional,
  isString,
  IsString,
  Min,
  ValidateNested,
  ValidationError,
} from 'class-validator';
import { parse as fromYAML } from 'yaml';

export class ParameterDefinition {
  @IsString()
  name: string;

  @IsIn(['string', 'number', 'boolean'])
  type: 'string' | 'number' | 'boolean';

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsNumber()
  default?: number;

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
  @Min(0)
  minLength?: number;

  @IsOptional()
  @IsNumber()
  maxLength?: number;

  @IsOptional()
  @IsString()
  section?: string;
}

export class ResourceDefinition {
  @IsString()
  name: string;

  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsObject()
  parameters: Record<string, string>;
}

export class UsageDefinition {
  @IsString()
  totalCpus: string;

  @IsString()
  totalMembery: string;

  @IsString()
  totalStorage: string;
}

export class ServiceDefinition {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterDefinition)
  parameters: ParameterDefinition[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceDefinition)
  resources: ResourceDefinition[];

  @ValidateNested()
  @Type(() => UsageDefinition)
  usage: UsageDefinition;
}

export class ResourcesDefinition {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceDefinition)
  resources: ResourceDefinition[];
}

export function parseDefinition(yaml: string) {
  const definitionJson = fromYAML(yaml);
  const definitionClass = plainToInstance(ServiceDefinition, definitionJson);

  return definitionClass;
}

export function validate(service: ServiceDefinition, target: Record<string, any>) {
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
    throw new BadRequestException(errors);
  }
}
