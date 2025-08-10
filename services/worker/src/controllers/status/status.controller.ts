import { BadRequestException, Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Resource, ResourceLogResult, RESOURCES_TOKEN, ResourceUsage } from 'src/resources/interface';
import { ApiDefaultResponses } from '../shared';
import {
  LogRequestDto,
  LogResultDto,
  ResourceLogDto,
  ResourceStatusDto,
  ResourceUsageDto,
  StatusRequestDto,
  StatusResultDto,
  UsageRequestDto,
  UsageResultDto,
} from './dtos';

@Controller('status')
@ApiTags('status')
@ApiDefaultResponses()
export class StatusController {
  constructor(
    @Inject(RESOURCES_TOKEN)
    private readonly resources: Map<string, Resource>,
  ) {}

  @Post('')
  @ApiOperation({ operationId: 'postStatus', description: 'Gets the status for all specified deployment IDs.' })
  @ApiOkResponse({ type: StatusResultDto })
  async postStatus(@Body() body: StatusRequestDto) {
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
        const resourceStatus = await resourceService.status(resource.resourceUniqueId, resource);

        return ResourceStatusDto.fromDomain(resourceStatus, resource.resourceUniqueId, resource.resourceType);
      }),
    );

    const result = new StatusResultDto();
    result.resources.push(...responses);
    return result;
  }

  @Post('usage')
  @ApiOperation({ operationId: 'postUsage', description: 'Gets the usages for all specified deployment IDs.' })
  @ApiOkResponse({ type: UsageResultDto })
  async postUsage(@Body() body: UsageRequestDto) {
    // Validate the request first.
    for (const resource of body.resources) {
      if (!this.resources.has(resource.resourceType)) {
        throw new BadRequestException(`Unknown resouce type ${resource.resourceType}`);
      }
    }

    // Execute all usage calls in parallel
    const responses = await Promise.all(
      body.resources.map(async (resource) => {
        let usage: ResourceUsage = { totalStorageGB: 0 };

        const resourceService = this.resources.get(resource.resourceType)!;
        if (resourceService.usage) {
          usage = await resourceService.usage?.(resource.resourceUniqueId, resource);
        }

        return ResourceUsageDto.fromDomain(usage, resource.resourceUniqueId, resource.resourceType);
      }),
    );

    const result = new UsageResultDto();
    result.resources.push(...responses);
    return result;
  }

  @Post('log')
  @ApiOperation({ operationId: 'postLog', description: 'Gets the logs for all specified deployment IDs.' })
  @ApiOkResponse({ type: LogResultDto })
  async postLog(@Body() body: LogRequestDto) {
    // Validate the request first.
    for (const resource of body.resources) {
      if (!this.resources.has(resource.resourceType)) {
        throw new BadRequestException(`Unknown resouce type ${resource.resourceType}`);
      }
    }

    // Execute all usage calls in parallel
    const responses = await Promise.all(
      body.resources.map(async (resource) => {
        let log: ResourceLogResult = { instances: [] };

        const resourceService = this.resources.get(resource.resourceType)!;
        if (resourceService.log) {
          log = await resourceService.log?.(resource.resourceUniqueId, resource);
        }

        return ResourceLogDto.fromDomain(log, resource.resourceUniqueId, resource.resourceType);
      }),
    );

    const result = new LogResultDto();
    result.resources.push(...responses);
    return result;
  }
}
