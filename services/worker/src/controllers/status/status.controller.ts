import { BadRequestException, Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Resource, RESOURCE_TOKEN } from 'src/resources/interface';
import { ResourceStatusDto, StatusRequestDto, StatusResultDto } from './dtos';

@Controller('status')
@ApiTags('status')
export class StatusController {
  constructor(
    @Inject(RESOURCE_TOKEN)
    private readonly resources: Resource[],
  ) {}

  @Post('')
  @ApiOperation({ operationId: 'postStatus', description: 'Gets the status for all specified deployment IDs' })
  @ApiOkResponse({ type: StatusResultDto })
  async postStatus(@Body() body: StatusRequestDto) {
    const result = new StatusResultDto();
    console.log('FF1');

    // Validate the request first.
    for (const identifier of body.resources) {
      const resource = this.resources.find((x) => x.descriptor.name === identifier.resourceType);
      if (!resource) {
        console.log('FF2' + identifier.resourceType);
        throw new BadRequestException(`Unknown resouce type ${identifier.resourceType}`);
      }
    }

    console.log('FF2');
    for (const identifier of body.resources) {
      const resource = this.resources.find((x) => x.descriptor.name === identifier.resourceType);

      // The resource exists as it has already been verified in the previous pass.
      const resourceResult = await resource.status(identifier.resourceId, { parameters: identifier.parameters });
      const resourceResponse = ResourceStatusDto.fromDomain(resourceResult, identifier.resourceId, identifier.resourceType);

      result.resources.push(resourceResponse);
    }
    console.log('FF');

    return result;
  }
}
