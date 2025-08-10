import { Body, Controller, Delete, Get, Post, Put, Query, Redirect, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import {
  CancelDeployment,
  ConfirmDeployment,
  CreateDeployment,
  CreateDeploymentResponse,
  DeleteDeployment,
  GetDeploymentChecks,
  GetDeploymentChecksResponse,
  GetDeploymentLogs,
  GetDeploymentLogsResponse,
  GetDeploymentStatus,
  GetDeploymentStatusResponse,
  GetDeploymentUsages,
  GetDeploymentUsagesResponse,
  GetTeamDeployments,
  GetTeamDeploymentsResponse,
  UpdateDeployment,
  UpdateDeploymentResponse,
  UrlService,
} from 'src/domain/services';
import { IntParam, isString } from 'src/lib';
import { TeamPermissionGuard } from '../TeamPermissionGuard';
import {
  CreateDeploymentDto,
  DeploymentCheckSummariesDto,
  DeploymentCreatedDto,
  DeploymentDto,
  DeploymentLogsDto,
  DeploymentsDto,
  DeploymentStatusDto,
  DeploymentUsageSummariesDto,
} from './dtos';

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
    private readonly urlService: UrlService,
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

    const result: CreateDeploymentResponse = await this.commandBus.execute(command);

    const response = new DeploymentCreatedDto();
    if (isString(result.deploymentOrRedirectUrl)) {
      response.redirectUrl = result.deploymentOrRedirectUrl;
    } else {
      response.deployment = DeploymentDto.fromDomain(result.deploymentOrRedirectUrl);
    }

    return response;
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
  async getStatus(@IntParam('teamId') teamId: number, @IntParam('deploymentId') deploymentId: number) {
    const result: GetDeploymentStatusResponse = await this.queryBus.execute(new GetDeploymentStatus(teamId, deploymentId));

    return DeploymentStatusDto.fromDomain(result.resources);
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
  @UseGuards(RoleGuard, TeamPermissionGuard)
  async getLogs(@IntParam('teamId') teamId: number, @IntParam('deploymentId') deploymentId: number) {
    const result: GetDeploymentLogsResponse = await this.queryBus.execute(new GetDeploymentLogs(teamId, deploymentId));

    return DeploymentLogsDto.fromDomain(result.resources);
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
  @UseGuards(RoleGuard, TeamPermissionGuard)
  async getChecks(
    @IntParam('teamId') teamId: number,
    @IntParam('deploymentId') deploymentId: number,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
  ) {
    const result: GetDeploymentChecksResponse = await this.queryBus.execute(
      new GetDeploymentChecks(teamId, deploymentId, fromDate, toDate),
    );

    return DeploymentCheckSummariesDto.fromDomain(result.checks);
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
  @UseGuards(RoleGuard, TeamPermissionGuard)
  async getUsage(
    @IntParam('teamId') teamId: number,
    @IntParam('deploymentId') deploymentId: number,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
  ) {
    const result: GetDeploymentUsagesResponse = await this.queryBus.execute(
      new GetDeploymentUsages(teamId, deploymentId, fromDate, toDate),
    );

    return DeploymentUsageSummariesDto.fromDomain(result.usages);
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
    const command = new UpdateDeployment(teamId, deploymentId, body.name, body.parameters, body.serviceId, req.user);
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
  async deleteDeployment(@IntParam('teamId') teamId: number, @IntParam('deploymentId') deploymentId: number) {
    const command = new DeleteDeployment(teamId, deploymentId);

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
    @IntParam('teamId') teamId: number,
    @IntParam('deploymentId') deploymentId: number,
    @Query('token') token: string,
    @Query('redirectUrl') redirectUrl?: string,
  ) {
    await this.commandBus.execute(new CancelDeployment(teamId, deploymentId, token));

    if (redirectUrl && !this.urlService.isValidRedirectUrl(redirectUrl)) {
      return Redirect(redirectUrl);
    } else {
      return Redirect('/');
    }
  }
}
