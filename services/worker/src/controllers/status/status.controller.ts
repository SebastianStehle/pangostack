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
  @ApiOperation({ operationId: 'getStatus', description: 'Gets the status for all specified deployment IDs' })
  @ApiOkResponse({ type: StatusResultDto })
  async getStatus(@Body() body: StatusRequestDto) {
    const result = new StatusResultDto();

    // Validate the request first.
    for (const identifier of body.resources) {
      const resource = this.resources.find((x) => x.descriptor.name === identifier.resourceName);
      if (!resource) {
        throw new BadRequestException(`Unknown resouce type ${identifier.resourceName}`);
      }
    }

    for (const identifier of body.resources) {
      const resource = this.resources.find((x) => x.descriptor.name === identifier.resourceName);

      // The resource exists as it has already been verified in the previous pass.
      const resourceResult = await resource.status(identifier.resourceId, { parameters: identifier.parameters });
      const resourceResponse = ResourceStatusDto.fromDomain(resourceResult, identifier.resourceId, identifier.resourceName);

      result.resources.push(resourceResponse);
    }

    return result;
  }
}
