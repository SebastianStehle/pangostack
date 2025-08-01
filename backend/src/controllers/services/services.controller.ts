import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_ADMIN, BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import { validateDefinition, yamlToDefinition } from 'src/domain/definitions';
import {
  CreateService,
  CreateServiceResponse,
  CreateServiceVersion,
  CreateServiceVersionResponse,
  DeleteService,
  DeleteServiceVersion,
  GetServices,
  GetServicesPublic,
  GetServicesPublicResponse,
  GetServicesResponse,
  GetServiceVersions,
  GetServiceVersionsResponse,
  UpdateService,
  UpdateServiceResponse,
  UpdateServiceVersion,
  UpdateServiceVersionResponse,
} from 'src/domain/services';
import { IntParam } from 'src/lib';
import {
  CreateServiceVersionDto,
  ServiceDto,
  ServicesDto,
  ServicesPublicDto,
  ServiceVersionDto,
  ServiceVersionsDto,
  UpdateServiceVersionDto,
  UpsertServiceDto,
} from './dtos';

@Controller('services')
@ApiTags('services')
@ApiSecurity('x-api-key')
@UseGuards(LocalAuthGuard)
export class ServicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('')
  @ApiOperation({ operationId: 'getServices', description: 'Gets all services.' })
  @ApiOkResponse({ type: ServicesDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getServices() {
    const result: GetServicesResponse = await this.queryBus.execute(new GetServices());

    return ServicesDto.fromDomain(result.services);
  }

  @Get('public')
  @ApiOperation({ operationId: 'getServicesPublic', description: 'Gets all services for end users.' })
  @ApiOkResponse({ type: ServicesPublicDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async getServicesPublic() {
    const result: GetServicesPublicResponse = await this.queryBus.execute(new GetServicesPublic());

    return ServicesPublicDto.fromDomain(result.services);
  }

  @Post('')
  @ApiOperation({ operationId: 'postService', description: 'Creates a service.' })
  @ApiOkResponse({ type: ServiceDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async postService(@Body() body: UpsertServiceDto) {
    const command = new CreateService(body);
    const result: CreateServiceResponse = await this.commandBus.execute(command);

    return ServiceDto.fromDomain(result.service);
  }

  @Put(':serviceId')
  @ApiOperation({ operationId: 'putService', description: 'Updates the service.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: ServiceDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async putService(@IntParam('serviceId') serviceId: number, @Body() body: UpsertServiceDto) {
    const command = new UpdateService(serviceId, body);
    const result: UpdateServiceResponse = await this.commandBus.execute(command);

    return ServiceDto.fromDomain(result.service);
  }

  @Delete(':serviceId')
  @ApiOperation({ operationId: 'deleteService', description: 'Deletes the service.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
    type: 'number',
  })
  @ApiNoContentResponse()
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async deleteService(@IntParam('serviceId') serviceId: number) {
    const command = new DeleteService(serviceId);

    await this.commandBus.execute(command);
  }

  @Get(':serviceId/versions')
  @ApiOperation({ operationId: 'getServiceVersions', description: 'Gets all services versions.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: ServiceVersionsDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getDeployments(@IntParam('serviceId') serviceId: number) {
    const result: GetServiceVersionsResponse = await this.queryBus.execute(new GetServiceVersions(serviceId));

    return ServiceVersionsDto.fromDomain(result.serviceVersions);
  }

  @Get(':serviceId/versions/:versionId')
  @ApiOperation({ operationId: 'getServiceVersion', description: 'Gets a service version.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
    type: 'number',
  })
  @ApiParam({
    name: 'versionId',
    description: 'The ID of the service version.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: ServiceVersionDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getServiceVersion(@IntParam('serviceId') serviceId: number, @Param('versionId') versionId: string) {
    const result: GetServiceVersionsResponse = await this.queryBus.execute(new GetServiceVersions(serviceId));

    const version = result.serviceVersions.find((x) => x.id === +versionId);
    if (!version) {
      throw new NotFoundException();
    }

    return ServiceVersionDto.fromDomain(version);
  }

  @Post(':serviceId/versions')
  @ApiOperation({ operationId: 'postServiceVersion', description: 'Creates a service version.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: ServiceVersionDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async postServiceVersion(@IntParam('serviceId') serviceId: number, @Body() body: CreateServiceVersionDto) {
    const { definition: yaml, ...other } = body;

    const definition = yamlToDefinition(yaml);
    await validateDefinition(definition);

    const command = new CreateServiceVersion(serviceId, { ...other, definition });
    const result: CreateServiceVersionResponse = await this.commandBus.execute(command);

    return ServiceVersionDto.fromDomain(result.serviceVersion);
  }

  @Put(':serviceId/versions/:versionId')
  @ApiOperation({ operationId: 'putServiceVersion', description: 'Updates the service version.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
    type: 'number',
  })
  @ApiParam({
    name: 'versionId',
    description: 'The ID of the service version.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: ServiceVersionDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async putServiceVersion(
    @IntParam('serviceId') _serviceId: number,
    @IntParam('versionId') versionId: number,
    @Body() body: UpdateServiceVersionDto,
  ) {
    const { definition: yaml, ...other } = body;

    const definition = yamlToDefinition(yaml);
    await validateDefinition(definition);

    const command = new UpdateServiceVersion(versionId, { ...other, definition });
    const result: UpdateServiceVersionResponse = await this.commandBus.execute(command);

    return ServiceVersionDto.fromDomain(result.serviceVersion);
  }

  @Delete(':serviceId/versions/:versionId')
  @ApiOperation({ operationId: 'deleteServiceVersion', description: 'Deletes the service version.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
    type: 'number',
  })
  @ApiParam({
    name: 'versionId',
    description: 'The ID of the service version.',
    required: true,
    type: 'number',
  })
  @ApiNoContentResponse()
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async deleteServiceVersion(@IntParam('serviceId') _serviceId: number, @IntParam('versionId') versionId: number) {
    const command = new DeleteServiceVersion(versionId);

    await this.commandBus.execute(command);
  }
}
