import { Body, Controller, Get, Inject, NotFoundException, NotImplementedException, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Resource, RESOURCES_TOKEN } from 'src/resources/interface';
import { ApiDefaultResponses } from '../shared';
import { ListRequestDto, ListResultDto, ResourcesTypesDto, ResourceTypeDto } from './dto';

@Controller('resources')
@ApiTags('resources')
@ApiDefaultResponses()
export class ResourcesController {
  constructor(
    @Inject(RESOURCES_TOKEN)
    private readonly resources: Map<string, Resource>,
  ) {}

  @Get('')
  @ApiOperation({ operationId: 'getResources', description: 'Gets the available resource types.' })
  @ApiOkResponse({ type: ResourcesTypesDto })
  getActions() {
    const result = new ResourcesTypesDto();

    for (const [, resource] of this.resources) {
      result.items.push(ResourceTypeDto.fromDomain(resource.descriptor));
    }

    return result;
  }

  @Post(':type/list')
  @ApiOperation({
    operationId: 'postResourceList',
    description: 'Lists the unique IDs of all resources of a type that the given credentials can see.',
  })
  @ApiOkResponse({ type: ListResultDto })
  async postResourceList(@Param('type') type: string, @Body() body: ListRequestDto) {
    const resource = this.resources.get(type);
    if (!resource) {
      throw new NotFoundException();
    }

    // Not every resource type can enumerate an account, the caller has to cope with that.
    if (!resource.list) {
      throw new NotImplementedException(`Resource type ${type} cannot enumerate its resources.`);
    }

    return ListResultDto.fromDomain(await resource.list(body));
  }

  @Get(':type')
  @ApiOperation({ operationId: 'getResource', description: 'Get details about a resource.' })
  @ApiOkResponse({})
  async getResource(@Param('type') type: string) {
    const resource = this.resources.get(type);
    if (!resource) {
      throw new NotFoundException();
    }

    let description = {};
    if (resource.describe) {
      description = await resource.describe();
    }

    return { resource, description };
  }
}
