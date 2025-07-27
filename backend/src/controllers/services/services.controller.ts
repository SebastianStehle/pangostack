import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_ADMIN, BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import {
  GetServices,
  GetServicesPublic,
  GetServicesPublicResponse,
  GetServicesResponse,
  GetServiceVersions,
  GetServiceVersionsResponse,
} from 'src/domain/services';
import { ServicesDto, ServicesPublicDto, ServiceVersionsDto } from './dtos';

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

  @Get(':id/versions')
  @ApiOperation({ operationId: 'getServiceVersions', description: 'Gets all services versions.' })
  @ApiOkResponse({ type: ServiceVersionsDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getDeployments(@Param('id') id: string) {
    const result: GetServiceVersionsResponse = await this.queryBus.execute(new GetServiceVersions(+id));

    return ServiceVersionsDto.fromDomain(result.serviceVersions);
  }
}
