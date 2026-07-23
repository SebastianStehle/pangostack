import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_ADMIN } from 'src/domain/database';
import {
  CreateWorker,
  CreateWorkerResult,
  DeleteWorker,
  GetResourceTypesQuery,
  GetWorkersQuery,
  UpdateWorker,
  UpdateWorkerResult,
} from 'src/domain/workers';
import { ResourceTypesDto, UpsertWorkerDto, WorkerDto, WorkersDto } from './dtos';

@Controller('api/workers')
@ApiTags('workers')
@ApiSecurity('x-api-key')
@UseGuards(LocalAuthGuard)
export class WorkersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('')
  @ApiOperation({ operationId: 'getWorkers', description: 'Gets the workers.' })
  @ApiOkResponse({ type: WorkersDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getWorkers() {
    const { workers } = await this.queryBus.execute(new GetWorkersQuery());

    return WorkersDto.fromDomain(workers);
  }

  @Post('')
  @ApiOperation({ operationId: 'postWorker', description: 'Creates a worker.' })
  @ApiOkResponse({ type: WorkerDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async postWorker(@Body() body: UpsertWorkerDto) {
    const { endpoint, apiKey } = body;

    const { worker } = await this.commandBus.execute<CreateWorker, CreateWorkerResult>(new CreateWorker({ endpoint, apiKey }));

    return WorkerDto.fromDomain(worker);
  }

  @Put(':id')
  @ApiOperation({ operationId: 'putWorker', description: 'Updates a worker.' })
  @ApiOkResponse({ type: WorkerDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async putWorker(@Param('id', ParseIntPipe) id: number, @Body() body: UpsertWorkerDto) {
    const { endpoint, apiKey } = body;

    const { worker } = await this.commandBus.execute<UpdateWorker, UpdateWorkerResult>(
      new UpdateWorker(id, { endpoint, apiKey }),
    );

    return WorkerDto.fromDomain(worker);
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'deleteWorker', description: 'Deletes a worker.' })
  @ApiNoContentResponse()
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async deleteWorker(@Param('id', ParseIntPipe) id: number) {
    await this.commandBus.execute(new DeleteWorker(id));
  }

  @Get('resource-types')
  @ApiOperation({ operationId: 'getResourceTypes', description: 'Gets the available resource types.' })
  @ApiOkResponse({ type: ResourceTypesDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getResourceTypes() {
    const { resourceTypes } = await this.queryBus.execute(new GetResourceTypesQuery());

    return ResourceTypesDto.fromDomain(resourceTypes);
  }
}
