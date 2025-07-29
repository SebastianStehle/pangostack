import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_ADMIN, BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import {
  CreateService,
  CreateServiceResponse,
  CreateServiceVersion,
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
} from 'src/domain/services';
import {
  CreateServiceVersionDto,
  ServiceDto,
  ServicesDto,
  ServicesPublicDto,
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
  })
  @ApiOkResponse({ type: ServiceDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async putService(@Param('serviceId') id: string, @Body() body: UpsertServiceDto) {
    const command = new UpdateService(+id, body);
    const result: UpdateServiceResponse = await this.commandBus.execute(command);

    return ServiceDto.fromDomain(result.service);
  }

  @Delete(':serviceId')
  @ApiOperation({ operationId: 'deleteService', description: 'Deletes the service.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
  })
  @ApiNoContentResponse()
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async deleteService(@Param('serviceId') id: string) {
    const command = new DeleteService(+id);

    await this.commandBus.execute(command);
  }

  @Get(':serviceId/versions')
  @ApiOperation({ operationId: 'getServiceVersions', description: 'Gets all services versions.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
  })
  @ApiOkResponse({ type: ServiceVersionsDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getDeployments(@Param('serviceId') id: string) {
    const result: GetServiceVersionsResponse = await this.queryBus.execute(new GetServiceVersions(+id));

    return ServiceVersionsDto.fromDomain(result.serviceVersions);
  }

  @Post('')
  @ApiOperation({ operationId: 'postServiceVersion', description: 'Creates a service version.' })
  @ApiOkResponse({ type: ServiceDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async postServiceVersion(@Param('serviceId') id: string, @Body() body: CreateServiceVersionDto) {
    const command = new CreateServiceVersion(+id, body);
    const result: CreateServiceResponse = await this.commandBus.execute(command);

    return ServiceDto.fromDomain(result.service);
  }

  @Put(':serviceId/versions/:versionId')
  @ApiOperation({ operationId: 'putServiceVersion', description: 'Updates the service version.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
  })
  @ApiParam({
    name: 'versionId',
    description: 'The ID of the service version.',
    required: true,
  })
  @ApiOkResponse({ type: ServiceDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async putServiceVersion(@Param('versionId') versionId: string, @Body() body: UpdateServiceVersionDto) {
    const command = new UpdateServiceVersion(+versionId, body);
    const result: UpdateServiceResponse = await this.commandBus.execute(command);

    return ServiceDto.fromDomain(result.service);
  }

  @Delete(':serviceId/versions/:versionId')
  @ApiOperation({ operationId: 'deleteServiceVersion', description: 'Deletes the service version.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
  })
  @ApiParam({
    name: 'versionId',
    description: 'The ID of the service version.',
    required: true,
  })
  @ApiNoContentResponse()
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async deleteServiceVersion(@Param('versionId') versionId: string) {
    const command = new DeleteServiceVersion(+versionId);

    await this.commandBus.execute(command);
  }
}
