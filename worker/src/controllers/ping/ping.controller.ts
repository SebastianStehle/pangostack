import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Resource, RESOURCES_TOKEN } from 'src/resources/interface';
import { ApiDefaultResponses } from '../shared';
import { PingResultDto } from './dtos';

// The start time is captured once, so that the backend can detect restarts of a worker.
const STARTED_AT = new Date().toISOString();

@Controller('ping')
@ApiTags('ping')
@ApiDefaultResponses()
export class PingController {
  constructor(
    @Inject(RESOURCES_TOKEN)
    private readonly resources: Map<string, Resource>,
  ) {}

  @Get('')
  @ApiOperation({ operationId: 'getPing', description: 'Checks whether the worker is alive.' })
  @ApiOkResponse({ type: PingResultDto })
  getPing() {
    const result = new PingResultDto();
    result.startedAt = STARTED_AT;
    result.resourceTypes = [...this.resources.keys()];
    return result;
  }
}
