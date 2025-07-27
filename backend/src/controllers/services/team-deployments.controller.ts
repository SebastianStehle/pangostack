import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_DEFAULT, TeamEntity, TeamRepository } from 'src/domain/database';
import {
  CreateDeployment,
  CreateDeploymentResponse,
  DeleteDeployment,
  GetTeamDeployments,
  GetTeamDeploymentsResponse,
  UpdateDeployment,
  UpdateDeploymentResponse,
} from 'src/domain/services';
import { User } from 'src/domain/users';
import { CreateDeploymentDto, DeploymentDto, DeploymentsDto } from './dtos';

@Controller('teams/:teamId/deployments')
@ApiParam({
  name: 'teamId',
  description: 'The ID of the team.',
  required: true,
})
@ApiTags('deployments')
@ApiSecurity('x-api-key')
@UseGuards(LocalAuthGuard)
export class TeamDeploymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
  ) {}

  @Get('')
  @ApiOperation({ operationId: 'getDeployments', description: 'Gets all deployments.' })
  @ApiOkResponse({ type: DeploymentsDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async getDeployments(@Req() req: Request, @Param('teamId') teamId: string) {
    await this.ensurePermission(req.user, +teamId);

    const result: GetTeamDeploymentsResponse = await this.queryBus.execute(new GetTeamDeployments(+teamId));

    return DeploymentsDto.fromDomain(result.deployments);
  }

  @Post('')
  @ApiOperation({ operationId: 'postDeployment', description: 'Creates a deployment.' })
  @ApiOkResponse({ type: DeploymentDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async postDeployment(@Req() req: Request, @Param('teamId') teamId: string, @Body() body: CreateDeploymentDto) {
    await this.ensurePermission(req.user, +teamId);

    const command = new CreateDeployment(+teamId, body.serviceId, body.parameters, req.user);
    const result: CreateDeploymentResponse = await this.commandBus.execute(command);

    return DeploymentDto.fromDomain(result.deployment);
  }

  @Put(':deploymentId')
  @ApiOperation({ operationId: 'putDeployment', description: 'Updates a deployment.' })
  @ApiParam({
    name: 'deploymentId',
    description: 'The ID of the deployment.',
    required: true,
  })
  @ApiOkResponse({ type: DeploymentDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async putDeployment(
    @Req() req: Request,
    @Param('teamId') teamId: string,
    @Param('deploymentId') deploymentId: string,
    @Body() body: CreateDeploymentDto,
  ) {
    await this.ensurePermission(req.user, +teamId);

    const command = new UpdateDeployment(+deploymentId, +teamId, body.parameters, body.serviceId, req.user);
    const result: UpdateDeploymentResponse = await this.commandBus.execute(command);

    return DeploymentDto.fromDomain(result.deployment);
  }

  @Delete(':deploymentId')
  @ApiParam({
    name: 'deploymentId',
    description: 'The ID of the deployment.',
    required: true,
  })
  @ApiOperation({ operationId: 'deleteDeployment', description: 'Delete a deployment.' })
  @ApiNoContentResponse()
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async deleteDeployment(@Param('deploymentId') deploymentId: string) {
    const command = new DeleteDeployment(+deploymentId);

    await this.commandBus.execute(command);
  }

  async ensurePermission(user: User, teamId: number) {
    const team = await this.teams.findOne({ where: { id: teamId }, relations: ['teamUsers'] });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found.`);
    }

    if (team.users.find((x) => x.userId === user.id)) {
      throw new ForbiddenException();
    }
  }
}
