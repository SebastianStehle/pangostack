import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_ADMIN, BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import {
  CreateServiceVersionVersionVersionVersionVersionVersion,
  CreateServiceResponse,
  GetServices,
  GetServicesPublic,
  GetServicesPublicResponse,
  GetServicesResponse,
  GetServiceVersions,
  GetServiceVersionsResponse,
  UpdateService,
  UpdateServiceResponse,
} from 'src/domain/services';
import { ServiceDto, ServicesDto, ServicesPublicDto, ServiceVersionsDto, UpsertServiceDto } from './dtos';

@Controller('services')
@ApiTags('services')
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
  @ApiOkResponse({ type: ServicesDto })
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

  @Put(':id')
  @ApiOperation({ operationId: 'putService', description: 'Updates the service.' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the service.',
    required: true,
  })
  @ApiOkResponse({ type: ServiceDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async putService(@Param('id') id: string, @Body() body: UpsertServiceDto) {
    const command = new UpdateService(+id, body);
    const result: UpdateServiceResponse = await this.commandBus.execute(command);

    return ServiceDto.fromDomain(result.service);
  }

  @Get(':id/versions')
  @ApiOperation({ operationId: 'getServiceVersions', description: 'Gets all services versions.' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the service.',
    required: true,
  })
  @ApiOkResponse({ type: ServiceVersionsDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getDeployments(@Param('id') id: string) {
    const result: GetServiceVersionsResponse = await this.queryBus.execute(new GetServiceVersions(+id));

    return ServiceVersionsDto.fromDomain(result.serviceVersions);
  }

  @Post('')
  @ApiOperation({ operationId: 'postServiceVersion', description: 'Creates a service version.' })
  @ApiOkResponse({ type: ServiceDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async postServiceVersion(@Body() body: UpsertServiceDto) {
    const command = new CreateServiceVersion(body);
    const result: CreateServiceResponse = await this.commandBus.execute(command);

    return ServiceDto.fromDomain(result.service);
  }

  @Put(':id/versions/:versionId')
  @ApiOperation({ operationId: 'putService', description: 'Updates the service version.' })
  @ApiParam({
    name: 'id',
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
  async putServiceVersion(@Param('id') id: string, @Body() body: UpsertServiceVersionDto) {
    const command = new UpdateServiceVersion(+id, body);
    const result: UpdateServiceResponse = await this.commandBus.execute(command);

    return ServiceDto.fromDomain(result.service);
  }
}
