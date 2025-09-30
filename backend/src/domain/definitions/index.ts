import { BadRequestException } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
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
  IsString,
  Min,
  validate,
  ValidateNested,
  ValidationError,
} from 'class-validator';
import { Document, isMap, isSeq, Pair, parse, YAMLError } from 'yaml';
import { evaluateExpression, flattenValidationErrors, is, isArray, isObject, isString } from 'src/lib';

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
  @IsBoolean()
  display?: boolean;

  @IsOptional()
  @IsBoolean()
  immutable?: boolean;

  @IsOptional()
  @IsBoolean()
  upgradeOnly?: boolean;

  @IsOptional()
  @IsString()
  label?: string | null;

  @IsOptional()
  @IsString()
  hint?: string | null;

  @IsOptional()
  defaultValue?: any | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterAllowedvalueClass)
  allowedValues?: ParameterAllowedvalueClass[] | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minValue?: number | null;

  @IsOptional()
  @IsNumber()
  maxValue?: number | null;

  @IsOptional()
  @IsNumber()
  step?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minLength?: number | null;

  @IsOptional()
  @IsNumber()
  maxLength?: number | null;

  @IsOptional()
  @IsIn(['default', 'textarea'])
  editor?: 'default' | 'textarea' | null;

  @IsOptional()
  @IsString()
  section?: string | null;
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
  @IsString()
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
  id: string;

  @IsDefined()
  @IsString()
  name: string;

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

  @IsOptional()
  @IsObject()
  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    if (!value || !isObject(value)) {
      return value;
    }

    const result = Object.fromEntries(
      Object.entries(value).map(([key, value]) => [key, plainToInstance(ResourceMappingClass, value)]),
    );
    return result;
  })
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

class ServicePriceClass {
  @IsDefined()
  @IsString()
  label: string;

  @IsDefined()
  @IsString()
  billingIdentifier: string;

  @IsDefined()
  @IsString()
  target: string;

  @IsDefined()
  @IsString()
  test: string;

  @IsDefined()
  @IsNumber()
  pricePerHour: number;
}

class ServiceDefinitionClass {
  @IsOptional()
  @IsString()
  afterInstallationInstructions?: string;

  @IsDefined()
  @IsString()
  @IsEnum(['fixed', 'pay_per_use'])
  pricingModel: ServicePricingModel;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicePriceClass)
  prices?: ServicePriceClass[];

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
export type ServicePrice = InstanceType<typeof ServicePriceClass>;
export type ServicePricingModel = 'fixed' | 'pay_per_use';
export type UsageDefinition = InstanceType<typeof UsageDefinitionClass>;

export function definitionToYaml(definition: ServiceDefinition) {
  const doc = new Document();
  doc.contents = doc.createNode(normalizeStrings(definition));

  function normalizeStrings(value: any): any {
    if (isString(value)) {
      return value.replace(/\r\n/g, '\n');
    } else if (isArray(value)) {
      return value.map(normalizeStrings);
    } else if (isObject(value)) {
      const result: any = {};
      for (const key in value) {
        result[key] = normalizeStrings(value[key]);
      }
      return result;
    }
    return value;
  }

  const setSpaceBefore = (value: any) => {
    (value as { spaceBefore?: boolean }).spaceBefore = true;
  };

  if (isMap(doc.contents)) {
    for (const item of doc.contents.items as Pair[]) {
      setSpaceBefore(item.key);

      if (isSeq(item.value)) {
        item.value.items.map((subItem, index) => {
          if (index > 0) {
            setSpaceBefore(subItem);
          }
        });
      }
    }
  }

  return doc.toString({ lineWidth: 0 }).trim();
}

export function yamlToDefinition(yaml: string | undefined | null): ServiceDefinition {
  if (!yaml) {
    return new ServiceDefinitionClass();
  }

  try {
    const definitionJson = parse(yaml);
    const definitionClass = plainToInstance(ServiceDefinitionClass, definitionJson);

    if (!is(definitionClass, ServiceDefinitionClass)) {
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
  const errors = await validate(service, { forbidUnknownValues: false });

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

type EvaluatedPrices = Record<string, { quantity: number }>;

export function evaluatePrices(service: ServiceDefinition, context: DefinitionContext): EvaluatedPrices {
  if (!service.prices || service.prices.length === 0) {
    return {};
  }

  const result: EvaluatedPrices = {};
  for (const price of service.prices) {
    const target = evaluateExpression(price.target, context);

    if (target == price.test) {
      const byIdentifier = result[price.billingIdentifier] || { quantity: 0 };
      byIdentifier.quantity++;
    }
  }

  return result;
}

export function evaluateParameters(resource: ResourceDefinition, context: DefinitionContext) {
  const result: Record<string, any> = { ...resource.parameters };

  for (const [key, value] of Object.entries(resource.parameters)) {
    let parsed = evaluateExpression(value, context) as string | null | undefined;

    if (parsed === 'undefined') {
      delete result[key];
      continue;
    }

    if (parsed === 'null') {
      parsed = null;
    }

    result[key] = parsed;
  }

  if (resource.mappings) {
    for (const [key, mapping] of Object.entries(resource.mappings)) {
      const value = evaluateExpression(mapping.value, context);

      const mapped = mapping.map[value];
      if (mapped) {
        result[key] = mapped;
      }
    }
  }

  return result;
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

export function validateParameters(service: ServiceDefinition, target: Record<string, any>, previous?: Record<string, string>) {
  const errors: ValidationError[] = [];

  for (const definition of service.parameters) {
    const key = definition.name;
    const valueExists = key in target;
    const valueRaw = target[key];

    const constraints: Record<string, any> = {};

    if (!valueExists && definition.required) {
      constraints['isDefined'] = '$property is required but was not provided';
    }

    if (definition.immutable && previous && previous[key] !== valueRaw) {
      constraints['isImmutable'] = '$property is immutable and cannot be changed';
    }

    if (valueExists) {
      let value = valueRaw;

      if (definition.type === 'boolean') {
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (lower === 'true' || lower === '1') {
            value = true;
          } else if (lower === 'false' || lower === '0') {
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
          constraints['isBoolean'] = '$property must be a boolean';
        }
      } else if (definition.type === 'number') {
        if (typeof value === 'string' && !isNaN(+value)) {
          value = +value;
        }

        if (!isNumber(value)) {
          constraints['isNumber'] = '$property must be a number';
        } else {
          if (definition.minValue && value < definition.minValue) {
            constraints['minValue'] = `$property must be at least ${definition.minValue}`;
          }
          if (definition.maxValue && value > definition.maxValue) {
            constraints['maxValue'] = `$property must be at most ${definition.maxValue}`;
          }
          if (definition.allowedValues && !definition.allowedValues.find((x) => x.value === value)) {
            constraints['enum'] = `$property must be at one of the allowed values`;
          }
        }
      } else if (definition.type === 'string') {
        if (!isString(value)) {
          constraints['isString'] = '$property must be a string';
        } else {
          if (definition.minLength && value.length < definition.minLength) {
            constraints['minLength'] = `$property must be at least ${definition.minLength} characters long`;
          }
          if (definition.maxLength && value.length > definition.maxLength) {
            constraints['maxLength'] = `$property must be at most ${definition.maxLength} characters long`;
          }
          if (definition.allowedValues && !definition.allowedValues.find((x) => x.value === value)) {
            constraints['enum'] = `$property must be at one of the allowed values`;
          }
        }
      }
    }

    if (Object.keys(constraints).length > 0) {
      const error: ValidationError = { property: `parameters.${key}`, constraints };

      errors.push(error);
    }
  }

  if (errors.length > 0) {
    throw new BadRequestException(flattenValidationErrors(errors));
  }
}
