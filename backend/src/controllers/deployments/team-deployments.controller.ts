import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import { CreateDeployment, GetTeamDeploymentsQuery } from 'src/domain/services';
import { IntParam, isString } from 'src/lib';
import { TeamPermissionGuard } from '../TeamPermissionGuard';
import { CreateDeploymentDto, DeploymentCreatedDto, DeploymentDto, DeploymentsDto } from './dtos';

@Controller('teams/:teamId/deployments')
@ApiParam({
  name: 'teamId',
  description: 'The ID of the team.',
  required: true,
  type: 'number',
})
@ApiTags('deployments')
@ApiSecurity('x-api-key')
@UseGuards(LocalAuthGuard)
export class TeamDeploymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('')
  @ApiOperation({ operationId: 'getTeamDeployments', description: 'Gets all deployments.' })
  @ApiOkResponse({ type: DeploymentsDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard, TeamPermissionGuard)
  async getDeployments(@IntParam('teamId') teamId: number) {
    const { deployments } = await this.queryBus.execute(new GetTeamDeploymentsQuery(teamId));

    return DeploymentsDto.fromDomain(deployments);
  }

  @Post('')
  @ApiOperation({ operationId: 'postTeamDeployment', description: 'Creates a deployment.' })
  @ApiOkResponse({ type: DeploymentCreatedDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard, TeamPermissionGuard)
  async postDeployment(@Req() req: Request, @IntParam('teamId') teamId: number, @Body() body: CreateDeploymentDto) {
    const command = new CreateDeployment(
      teamId,
      body.name,
      body.serviceId,
      body.parameters,
      body.confirmUrl,
      body.cancelUrl,
      req.user,
    );

    const { deploymentOrRedirectUrl } = await this.commandBus.execute(command);

    const response = new DeploymentCreatedDto();
    if (isString(deploymentOrRedirectUrl)) {
      response.redirectUrl = deploymentOrRedirectUrl;
    } else {
      response.deployment = DeploymentDto.fromDomain(deploymentOrRedirectUrl);
    }

    return response;
  }
}
