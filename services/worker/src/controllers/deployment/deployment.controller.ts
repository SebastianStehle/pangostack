import { BadRequestException, Body, Controller, Delete, Get, Inject, Post, ValidationError } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { isBoolean, isNumber, isString } from 'class-validator';
import { Resource, RESOURCE_TOKEN, ResourceDescriptor } from 'src/resources/interface';
import { ResourceApplyRequestDto, ResourceApplyResponseDto, ResourcesDeleteRequestDto, ResourcesTypesDto, ResourceTypeDto } from './dto';

@Controller('deployment')
@ApiTags('deployment')
export class DeploymentController {
  constructor(
    @Inject(RESOURCE_TOKEN)
    private readonly resources: Resource[],
  ) {}

  @Post('')
  @ApiOperation({ operationId: 'apply', description: 'Applies the resource' })
  @ApiOkResponse({ type: ResourceApplyResponseDto })
  async apply(@Body() body: ResourceApplyRequestDto) {
    const resource = this.resources.find((x) => x.descriptor.name === body.resourceName);
    if (!resource) {
      throw new BadRequestException(`Unknown resouce type ${body.resourceName}`);
    }

    validate(resource.descriptor, body.parameters);

    const result = await resource.apply(body.resourceId, body);
    const response = ResourceApplyResponseDto.fromDomain(result);

    return response;
  }

  @Delete('')
  @ApiOperation({ operationId: 'delete', description: 'Deletes all resources with the specified IDs.' })
  @ApiNoContentResponse()
  async deleteResources(@Body() body: ResourcesDeleteRequestDto) {
    // Validate the request first.
    for (const identifier of body.resources) {
      const resource = this.resources.find((x) => x.descriptor.name === identifier.resourceName);
      if (!resource) {
        throw new BadRequestException(`Unknown resouce type ${identifier.resourceName}`);
      }
    }

    for (const identifier of body.resources) {
      const resource = this.resources.find((x) => x.descriptor.name === identifier.resourceName);

      await resource.delete(identifier.resourceId, identifier);
    }
  }

  @Get('types')
  @ApiOperation({ operationId: 'getTypes', description: 'Gets the available resource types' })
  @ApiOkResponse({ type: ResourcesTypesDto })
  getActions() {
    const result = new ResourcesTypesDto();

    for (const resource of this.resources) {
      result.items.push(ResourceTypeDto.fromDomain(resource.descriptor));
    }

    return result;
  }
}

function validate(descriptor: ResourceDescriptor, target: Record<string, any>) {
  const errors: ValidationError[] = [];

  for (const [key, definition] of Object.entries(descriptor.parameters)) {
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
