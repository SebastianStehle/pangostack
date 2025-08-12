import { BadRequestException, Body, Controller, Delete, Get, Inject, Post, ValidationError } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { isBoolean, isNumber, isString } from 'class-validator';
import { Resource, ResourceDescriptor, RESOURCES_TOKEN } from 'src/resources/interface';
import { ApiDefaultResponses, ResourceRequestDto } from '../shared';
import { ResourceApplyResponseDto, ResourcesDeleteRequestDto, ResourcesTypesDto, ResourceTypeDto } from './dto';

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
      throw new BadRequestException(`Unknown resouce type ${body.resourceType}`);
    }

    validate(resource.descriptor, body.parameters);

    const result = await resource.apply(body.resourceUniqueId, body);
    const response = ResourceApplyResponseDto.fromDomain(result);

    return response;
  }

  @Delete('')
  @ApiOperation({ operationId: 'deleteResources', description: 'Deletes all resources with the specified IDs.' })
  @ApiNoContentResponse()
  async deleteResources(@Body() body: ResourcesDeleteRequestDto) {
    // Validate the request first.
    for (const identifier of body.resources) {
      if (!this.resources.has(identifier.resourceType)) {
        throw new BadRequestException(`Unknown resouce type ${identifier.resourceType}`);
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

  @Get('types')
  @ApiOperation({ operationId: 'getTypes', description: 'Gets the available resource types.' })
  @ApiOkResponse({ type: ResourcesTypesDto })
  getActions() {
    const result = new ResourcesTypesDto();

    for (const [, resource] of this.resources) {
      result.items.push(ResourceTypeDto.fromDomain(resource.descriptor));
    }

    return result;
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
      constraints['isDefined'] = 'Value is required but was not provided';
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
        }
      } else if (definition.type === 'string') {
        if (!isString(value)) {
          constraints['isString'] = 'Value must be a string';
        } else {
          if (valueExists && value.length === 0 && definition.required) {
            constraints['isDefined'] = 'Value is required but was not provided';
          }

          if (definition.minLength && value.length < definition.minLength) {
            constraints['minLength'] = `Value must be at least ${definition.minLength} characters long`;
          }

          if (definition.maxLength && value.length > definition.maxLength) {
            constraints['maxLength'] = `Value must be at most ${definition.maxLength} characters long`;
          }

          if (definition.allowedValues && definition.allowedValues.length > 0 && definition.allowedValues.indexOf(value) < 0) {
            constraints['enum'] = `Value must be one of ${definition.allowedValues.join(', ')}`;
          }
        }
      }
    }

    if (Object.keys(constraints).length > 0) {
      errors.push({ property: `parameters.${key}`, constraints });
    }
  }

  if (errors.length > 0) {
    throw new BadRequestException(errors);
  }
}
