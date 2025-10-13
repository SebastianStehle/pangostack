import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_ADMIN, BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import { validateDefinition, yamlToDefinition } from 'src/domain/definitions';
import {
  CreateService,
  CreateServiceVersion,
  DeleteService,
  DeleteServiceVersion,
  GetServicesPublicQuery,
  GetServicesQuery,
  GetServiceVersionsQuery,
  UpdateService,
  UpdateServiceVersion,
  VerifyDefinitionQuery,
} from 'src/domain/services';
import { IntParam } from 'src/lib';
import {
  CreateServiceVersionDto,
  ServiceDto,
  ServicePublicDto,
  ServicesDto,
  ServicesPublicDto,
  ServiceVersionDto,
  ServiceVersionsDto,
  UpdateServiceVersionDto,
  UpsertServiceDto,
  VerifyServiceVersionDto,
} from './dtos';

@Controller('api/services')
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
    const { services } = await this.queryBus.execute(new GetServicesQuery());

    return ServicesDto.fromDomain(services);
  }

  @Get('public')
  @ApiOperation({ operationId: 'getServicesPublic', description: 'Gets all services for end users.' })
  @ApiOkResponse({ type: ServicesPublicDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async getServicesPublic() {
    const { services } = await this.queryBus.execute(new GetServicesPublicQuery());

    return ServicesPublicDto.fromDomain(services);
  }

  @Get('/public/:serviceId')
  @ApiOperation({ operationId: 'getServicePublic', description: 'Gets the service with the public properties.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: ServicePublicDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getServicePublic(@IntParam('serviceId') serviceId: number) {
    const { services } = await this.queryBus.execute(new GetServicesPublicQuery());
    const service = services.find((x) => x.id === serviceId);

    if (!service) {
      throw new NotFoundException();
    }

    return ServicePublicDto.fromDomain(service);
  }

  @Post('')
  @ApiOperation({ operationId: 'postService', description: 'Creates a service.' })
  @ApiOkResponse({ type: ServiceDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async postService(@Body() body: UpsertServiceDto) {
    const command = new CreateService(body);
    const { service } = await this.commandBus.execute(command);

    return ServiceDto.fromDomain(service);
  }

  @Get(':serviceId')
  @ApiOperation({ operationId: 'getService', description: 'Gets the service.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: ServiceDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getService(@IntParam('serviceId') serviceId: number) {
    const { services } = await this.queryBus.execute(new GetServicesQuery());
    const service = services.find((x) => x.id === serviceId);

    if (!service) {
      throw new NotFoundException();
    }

    return ServiceDto.fromDomain(service);
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
    const { service } = await this.commandBus.execute(command);

    return ServiceDto.fromDomain(service);
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
  async getVersions(@IntParam('serviceId') serviceId: number) {
    const { serviceVersions } = await this.queryBus.execute(new GetServiceVersionsQuery(serviceId));

    return ServiceVersionsDto.fromDomain(serviceVersions);
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
    const { serviceVersions } = await this.queryBus.execute(new GetServiceVersionsQuery(serviceId));

    const version = serviceVersions.find((x) => x.id === +versionId);
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

    const command = new CreateServiceVersion(serviceId, { ...other, definition, definitionSource: yaml });
    const { serviceVersion } = await this.commandBus.execute(command);

    return ServiceVersionDto.fromDomain(serviceVersion);
  }

  @Post(':serviceId/versions/verify')
  @ApiOperation({ operationId: 'postVerifyServiceVersion', description: 'Verifies a service version.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
    type: 'number',
  })
  @ApiNoContentResponse()
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async postVerifyServiceVersion(@IntParam('serviceId') serviceId: number, @Body() body: VerifyServiceVersionDto) {
    const definition = yamlToDefinition(body.definition);
    await validateDefinition(definition);

    await this.queryBus.execute(new VerifyDefinitionQuery(serviceId, definition, body.environment));
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
    const { serviceVersion } = await this.commandBus.execute(command);

    return ServiceVersionDto.fromDomain(serviceVersion);
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
