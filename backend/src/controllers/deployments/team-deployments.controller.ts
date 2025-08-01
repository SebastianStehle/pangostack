import { Body, Controller, Delete, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import {
  CreateDeployment,
  CreateDeploymentResponse,
  DeleteDeployment,
  GetDeploymentStatus,
  GetDeploymentStatusResponse,
  GetTeamDeployments,
  GetTeamDeploymentsResponse,
  UpdateDeployment,
  UpdateDeploymentResponse,
} from 'src/domain/services';
import { IntParam } from 'src/lib';
import { TeamPermissionGuard } from '../TeamPermissionGuard';
import { CreateDeploymentDto, DeploymentDto, DeploymentsDto, DeploymentStatusDto } from './dtos';

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
  @ApiOperation({ operationId: 'getDeployments', description: 'Gets all deployments.' })
  @ApiOkResponse({ type: DeploymentsDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard, TeamPermissionGuard)
  async getDeployments(@IntParam('teamId') teamId: number) {
    const result: GetTeamDeploymentsResponse = await this.queryBus.execute(new GetTeamDeployments(teamId));

    return DeploymentsDto.fromDomain(result.deployments);
  }

  @Post('')
  @ApiOperation({ operationId: 'postDeployment', description: 'Creates a deployment.' })
  @ApiOkResponse({ type: DeploymentDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard, TeamPermissionGuard)
  async postDeployment(@Req() req: Request, @IntParam('teamId') teamId: number, @Body() body: CreateDeploymentDto) {
    const command = new CreateDeployment(teamId, body.name, body.serviceId, body.parameters, req.user);
    const result: CreateDeploymentResponse = await this.commandBus.execute(command);

    return DeploymentDto.fromDomain(result.deployment);
  }

  @Get(':deploymentId/status')
  @ApiOperation({ operationId: 'getDeploymentStatus', description: 'Gets deployments status.' })
  @ApiParam({
    name: 'deploymentId',
    description: 'The ID of the deployment.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: DeploymentStatusDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard, TeamPermissionGuard)
  async getDeploymentStatus(@IntParam('deploymentId') deploymentId: number) {
    const result: GetDeploymentStatusResponse = await this.queryBus.execute(new GetDeploymentStatus(deploymentId));

    return DeploymentStatusDto.fromDomain(result.resources);
  }

  @Put(':deploymentId')
  @ApiOperation({ operationId: 'putDeployment', description: 'Updates a deployment.' })
  @ApiParam({
    name: 'deploymentId',
    description: 'The ID of the deployment.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: DeploymentDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard, TeamPermissionGuard)
  async putDeployment(
    @Req() req: Request,
    @IntParam('teamId') teamId: number,
    @IntParam('deploymentId') deploymentId: number,
    @Body() body: CreateDeploymentDto,
  ) {
    const command = new UpdateDeployment(deploymentId, teamId, body.name, body.parameters, body.serviceId, req.user);
    const result: UpdateDeploymentResponse = await this.commandBus.execute(command);

    return DeploymentDto.fromDomain(result.deployment);
  }

  @Delete(':deploymentId')
  @ApiParam({
    name: 'deploymentId',
    description: 'The ID of the deployment.',
    required: true,
    type: 'number',
  })
  @ApiOperation({ operationId: 'deleteDeployment', description: 'Delete a deployment.' })
  @ApiNoContentResponse()
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard, TeamPermissionGuard)
  async deleteDeployment(@IntParam('deploymentId') deploymentId: number) {
    const command = new DeleteDeployment(deploymentId);

    await this.commandBus.execute(command);
  }
}
