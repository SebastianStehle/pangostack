import { BadRequestException, Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Resource, RESOURCES_TOKEN } from 'src/resources/interface';
import { ResourceStatusDto, ResourceUsageDto, StatusRequestDto, StatusResultDto, UageRequestDto, UsageResultDto } from './dtos';

@Controller('status')
@ApiTags('status')
export class StatusController {
  constructor(
    @Inject(RESOURCES_TOKEN)
    private readonly resources: Map<string, Resource>,
  ) {}

  @Post('')
  @ApiOperation({ operationId: 'postStatus', description: 'Gets the status for all specified deployment IDs' })
  @ApiOkResponse({ type: StatusResultDto })
  async postStatus(@Body() body: StatusRequestDto) {
    throw new Error('FOOBAR');
    // Validate the request first.
    for (const identifier of body.resources) {
      if (!this.resources.has(identifier.resourceType)) {
        throw new BadRequestException(`Unknown resouce type ${identifier.resourceType}`);
      }
    }

    // Execute all status calls in parallel
    const responses = await Promise.all(
      body.resources.map(async (resource) => {
        const resourceService = this.resources.get(resource.resourceType)!;
        const resourceStatus = await resourceService.status(resource.resourceId, resource);

        return ResourceStatusDto.fromDomain(resourceStatus, resource.resourceId, resource.resourceType);
      }),
    );

    const result = new StatusResultDto();
    result.resources.push(...responses);
    return result;
  }

  @Post('usage')
  @ApiOperation({ operationId: 'postUsage', description: 'Gets the usages for all specified deployment IDs' })
  @ApiOkResponse({ type: UsageResultDto })
  async postUsage(@Body() body: UageRequestDto) {
    // Validate the request first.
    for (const resource of body.resources) {
      if (!this.resources.has(resource.resourceType)) {
        throw new BadRequestException(`Unknown resouce type ${resource.resourceType}`);
      }
    }

    // Execute all usage calls in parallel
    const responses = await Promise.all(
      body.resources.map(async (resource) => {
        const resourceService = this.resources.get(resource.resourceType)!;
        const resourceUsage = await resourceService.usage(resource.resourceId, resource);

        return ResourceUsageDto.fromDomain(resourceUsage, resource.resourceId, resource.resourceType);
      }),
    );

    const result = new UsageResultDto();
    result.resources.push(...responses);
    return result;
  }
}
