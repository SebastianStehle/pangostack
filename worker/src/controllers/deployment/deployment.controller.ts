import { BadRequestException, Body, Controller, Delete, Inject, Post, ValidationError } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { isBoolean, isNumber, isString } from 'class-validator';
import { Resource, ResourceDescriptor, RESOURCES_TOKEN } from 'src/resources/interface';
import { ApiDefaultResponses, ResourceRequestDto } from '../shared';
import { ResourceApplyResponseDto, ResourcesDeleteRequestDto } from './dto';

@Controller('deployment')
@ApiTags('deployment')
@ApiDefaultResponses()
export class DeploymentController {
  constructor(
    @Inject(RESOURCES_TOKEN)
    private readonly resources: Map<string, Resource>,
  ) {}

  @Post('')
  @ApiOperation({ operationId: 'applyResource', description: 'Applies the resource.' })
  @ApiOkResponse({ type: ResourceApplyResponseDto })
  async applyResource(@Body() body: ResourceRequestDto) {
    const resource = this.resources.get(body.resourceType);
    if (!resource) {
      throw new BadRequestException(`Unknown resource type ${body.resourceType}`);
    }

    validate(resource.descriptor, body.parameters);

    const result = await resource.apply(body.resourceUniqueId, body);
    const response = ResourceApplyResponseDto.fromDomain(result);

    return response;
  }

  @Post('verify')
  @ApiOperation({ operationId: 'verifyResource', description: 'Applies the resource.' })
  @ApiNoContentResponse()
  async verifyResource(@Body() body: ResourceRequestDto) {
    const resource = this.resources.get(body.resourceType);
    if (!resource) {
      throw new BadRequestException(`Unknown resource type ${body.resourceType}`);
    }

    validate(resource.descriptor, body.parameters);
    
    await (resource.verify?.(body.resourceUniqueId, body) ?? Promise.resolve(true));
  }

  @Delete('')
  @ApiOperation({ operationId: 'deleteResources', description: 'Deletes all resources with the specified IDs.' })
  @ApiNoContentResponse()
  async deleteResources(@Body() body: ResourcesDeleteRequestDto) {
    // Validate the request first.
    for (const identifier of body.resources) {
      if (!this.resources.has(identifier.resourceType)) {
        throw new BadRequestException(`Unknown resource type ${identifier.resourceType}`);
      }
    }

    // Now we know that the resource will always exist.
    await Promise.all(
      body.resources.map((identifier) => {
        const resource = this.resources.get(identifier.resourceType)!;

        return resource.delete(identifier.resourceUniqueId, identifier);
      }),
    );
  }
}

function validate(descriptor: ResourceDescriptor, target: Record<string, any>) {
  const errors: ValidationError[] = [];

  for (const [key, value] of Object.entries(target)) {
    if (value === 'undefined') {
      target[key] = undefined;
    } else if (value === 'null') {
      target[key] = null;
    }
  }

  for (const [key, definition] of Object.entries(descriptor.parameters)) {
    const valueExists = key in target;
    const valueRaw = target[key];
    let value = valueRaw;

    const constraints: Record<string, string> = {};
    if (!valueExists && definition.required) {
      constraints['isDefined'] = '$property is required but was not provided';
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
          constraints['isBoolean'] = '$property must be a boolean';
        }
      } else if (definition.type === 'number') {
        if (typeof value === 'string' && !isNaN(+value)) {
          value = +value;
        }

        if (!isNumber(value)) {
          constraints['isNumber'] = '$property must be a number';
        }
      } else if (definition.type === 'string') {
        if (!isString(value)) {
          constraints['isString'] = '$property must be a string';
        } else {
          if (valueExists && value.length === 0 && definition.required) {
            constraints['isDefined'] = '$property is required but was not provided';
          }

          if (definition.minLength && value.length < definition.minLength) {
            constraints['minLength'] = `$property must be at least ${definition.minLength} characters long`;
          }

          if (definition.maxLength && value.length > definition.maxLength) {
            constraints['maxLength'] = `$property must be at most ${definition.maxLength} characters long`;
          }

          if (definition.allowedValues && definition.allowedValues.length > 0 && definition.allowedValues.indexOf(value) < 0) {
            constraints['enum'] = `$property must be one of ${definition.allowedValues.join(', ')}`;
          }
        }
      }
    }

    if (Object.keys(constraints).length > 0) {
      errors.push({ property: `parameters.${key}`, constraints });
    }
  }

  if (errors.length > 0) {
    throw new BadRequestException(flattenValidationErrors(errors));
  }
}


export function flattenValidationErrors(validationErrors: ValidationError[]): string[] {
  const result: string[] = [];

  for (const error of validationErrors) {
    const children = mapChildrenToValidationErrors(error);

    for (const childError of children) {
      if (!childError.constraints) {
        continue;
      }

      const messages = Object.values(childError.constraints).map((error) => error.replace('$property', childError.property));
      result.push(...messages);
    }
  }

  return result;
}

function mapChildrenToValidationErrors(error: ValidationError, parentPath?: string): ValidationError[] {
  if (!(error.children && error.children.length)) {
    return [error];
  }

  const validationErrors: ValidationError[] = [];

  parentPath = parentPath ? `${parentPath}.${error.property}` : error.property;
  for (const item of error.children) {
    if (item.children && item.children.length) {
      validationErrors.push(...mapChildrenToValidationErrors(item, parentPath));
    }
    validationErrors.push(prependConstraintsWithParentProp(parentPath, item));
  }

  return validationErrors;
}

function prependConstraintsWithParentProp(parentPath: string, error: ValidationError): ValidationError {
  const constraints: Record<string, string> = {};

  for (const key in error.constraints) {
    constraints[key] = `${parentPath}.${error.constraints[key]}`;
  }

  return { ...error, constraints };
}
