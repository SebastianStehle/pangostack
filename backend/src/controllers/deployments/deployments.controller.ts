import { Body, Controller, Delete, Get, NotFoundException, Put, Query, Redirect, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_ADMIN, BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import {
  CancelDeployment,
  ConfirmDeployment,
  DeleteDeployment,
  GetDeploymentChecksQuery,
  GetDeploymentLogsQuery,
  GetDeploymentQuery,
  GetDeploymentsQuery,
  GetDeploymentStatusQuery,
  GetDeploymentUsagesQuery,
  UpdateDeployment,
  UrlService,
} from 'src/domain/services';
import { AllowAllDeploymentPolicy, AllowTeamDeploymentPolicy } from 'src/domain/services/policies';
import { GetTeamsQuery, User } from 'src/domain/users';
import { IntParam, IntQuery } from 'src/lib';
import { TeamPermissionGuard } from '../TeamPermissionGuard';
import {
  CreateDeploymentDto,
  DeploymentCheckSummariesDto,
  DeploymentDto,
  DeploymentLogsDto,
  DeploymentsDto,
  DeploymentStatusDto,
  DeploymentUsageSummariesDto,
} from './dtos';

@Controller('deployments')
@ApiTags('deployments')
@ApiSecurity('x-api-key')
@UseGuards(LocalAuthGuard)
export class DeploymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly urlService: UrlService,
  ) {}

  @Get('')
  @ApiOperation({ operationId: 'getDeployments', description: 'Gets all deployments.' })
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
  async getDeployments(@IntQuery('page') page: number, @IntQuery('pageSize', 20) pageSize: number) {
    const { deployments, total } = await this.queryBus.execute(new GetDeploymentsQuery(page, pageSize));

    return DeploymentsDto.fromDomain(deployments, total);
  }

  @Get(':deploymentId')
  @ApiOperation({ operationId: 'getDeployment', description: 'Gets a deployment by ID.' })
  @ApiParam({
    name: 'deploymentId',
    description: 'The ID of the deployment.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: DeploymentDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async getDeployment(@Req() req: Request, @IntParam('deploymentId') deploymentId: number) {
    const policy = await this.getPolicy(req.user);
    const { deployment } = await this.queryBus.execute(new GetDeploymentQuery(deploymentId, policy));

    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found.`);
    }

    return DeploymentDto.fromDomain(deployment);
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
  @UseGuards(RoleGuard)
  async putDeployment(@Req() req: Request, @IntParam('deploymentId') deploymentId: number, @Body() body: CreateDeploymentDto) {
    const policy = await this.getPolicy(req.user);

    const command = new UpdateDeployment(deploymentId, policy, body.name, body.parameters, body.serviceId, req.user);
    const { deployment } = await this.commandBus.execute(command);

    return DeploymentDto.fromDomain(deployment);
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
  @UseGuards(RoleGuard)
  async getStatus(@Req() req: Request, @IntParam('deploymentId') deploymentId: number) {
    const policy = await this.getPolicy(req.user);
    const { resources } = await this.queryBus.execute(new GetDeploymentStatusQuery(deploymentId, policy));

    return DeploymentStatusDto.fromDomain(resources);
  }

  @Get(':deploymentId/logs')
  @ApiOperation({ operationId: 'getDeploymentLogs', description: 'Gets deployments logs.' })
  @ApiParam({
    name: 'deploymentId',
    description: 'The ID of the deployment.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: DeploymentLogsDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async getLogs(@Req() req: Request, @IntParam('deploymentId') deploymentId: number) {
    const policy = await this.getPolicy(req.user);
    const { resources } = await this.queryBus.execute(new GetDeploymentLogsQuery(deploymentId, policy));

    return DeploymentLogsDto.fromDomain(resources);
  }

  @Get(':deploymentId/checks')
  @ApiOperation({ operationId: 'getDeploymentChecks', description: 'Gets deployments status.' })
  @ApiParam({
    name: 'deploymentId',
    description: 'The ID of the deployment.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: DeploymentCheckSummariesDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async getChecks(
    @Req() req: Request,
    @IntParam('deploymentId') deploymentId: number,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
  ) {
    const policy = await this.getPolicy(req.user);
    const { checks } = await this.queryBus.execute(new GetDeploymentChecksQuery(deploymentId, policy, fromDate, toDate));

    return DeploymentCheckSummariesDto.fromDomain(checks);
  }

  @Get(':deploymentId/usage')
  @ApiOperation({ operationId: 'getDeploymentUsage', description: 'Gets usage summaries.' })
  @ApiParam({
    name: 'deploymentId',
    description: 'The ID of the deployment.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: DeploymentUsageSummariesDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async getUsage(
    @Req() req: Request,
    @IntParam('deploymentId') deploymentId: number,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
  ) {
    const policy = await this.getPolicy(req.user);
    const { usages } = await this.queryBus.execute(new GetDeploymentUsagesQuery(deploymentId, policy, fromDate, toDate));

    return DeploymentUsageSummariesDto.fromDomain(usages);
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
  @UseGuards(RoleGuard)
  async deleteDeployment(@Req() req: Request, @IntParam('deploymentId') deploymentId: number) {
    const policy = await this.getPolicy(req.user);
    const command = new DeleteDeployment(deploymentId, policy);

    await this.commandBus.execute(command);
  }

  @Get(':deploymentId/confirm')
  @UseGuards(TeamPermissionGuard)
  async confirmDeployment(
    @IntParam('teamId') teamId: number,
    @IntParam('deploymentId') deploymentId: number,
    @Query('token') token: string,
    @Query('redirectUrl') redirectUrl?: string,
  ) {
    await this.commandBus.execute(new ConfirmDeployment(teamId, deploymentId, token));

    if (redirectUrl && !this.urlService.isValidRedirectUrl(redirectUrl)) {
      return Redirect(redirectUrl);
    } else {
      return Redirect('/');
    }
  }

  @Get(':deploymentId/cancel')
  @UseGuards(TeamPermissionGuard)
  async cancelDeployment(
    @IntParam('deploymentId') deploymentId: number,
    @Query('token') token: string,
    @Query('redirectUrl') redirectUrl?: string,
  ) {
    await this.commandBus.execute(new CancelDeployment(deploymentId, token));

    if (redirectUrl && !this.urlService.isValidRedirectUrl(redirectUrl)) {
      return Redirect(redirectUrl);
    } else {
      return Redirect('/');
    }
  }

  async getPolicy(user: User) {
    if (user.roles?.indexOf(BUILTIN_USER_GROUP_ADMIN)) {
      return new AllowAllDeploymentPolicy();
    }

    const { teams } = await this.queryBus.execute(new GetTeamsQuery(user));
    return new AllowTeamDeploymentPolicy(teams.map((x) => x.id));
  }
}
