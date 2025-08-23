import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_ADMIN } from 'src/domain/database';
import { GetDeploymentsQuery } from 'src/domain/services';
import { IntParam, IntQuery } from 'src/lib';
import { DeploymentsDto } from '../deployments/dtos';

@Controller('api/services')
@ApiTags('services')
@ApiSecurity('x-api-key')
@UseGuards(LocalAuthGuard)
export class ServiceDeploymentsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':serviceId/deployments')
  @ApiOperation({ operationId: 'getServiceDeployments', description: 'Gets all deployments.' })
  @ApiParam({
    name: 'serviceId',
    description: 'The ID of the service.',
    required: true,
    type: 'number',
  })
  @ApiQuery({
    name: 'page',
    description: 'The page count.',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'The page size.',
    required: false,
    type: Number,
  })
  @ApiOkResponse({ type: DeploymentsDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getServiceDeployments(
    @IntParam('serviceId') serviceId: number,
    @IntQuery('page') page: number,
    @IntQuery('pageSize', 20) pageSize: number,
  ) {
    const { deployments, total } = await this.queryBus.execute(new GetDeploymentsQuery(page, pageSize, 0, serviceId));

    return DeploymentsDto.fromDomain(deployments, total);
  }
}
