import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  CreateDeployment,
  CreateDeploymentResponse,
  DeleteDeployment,
  GetDeployments,
  GetDeploymentsResponse,
  UpdateDeployment,
  UpdateDeploymentResponse,
} from 'src/domain/services';
import { CreateDeploymentDto, DeploymentDto, DeploymentsDto } from './dtos';

@Controller('teams/:teamId/deployments')
@ApiTags('deployments')
export class DeploymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('')
  @ApiOperation({ operationId: 'getDeployments', description: 'Gets all deployments.' })
  @ApiOkResponse({ type: DeploymentsDto })
  async getDeployments(@Param('teamId') teamId: string) {
    const result: GetDeploymentsResponse = await this.queryBus.execute(new GetDeployments(+teamId));

    return DeploymentsDto.fromDomain(result.deployments);
  }

  @Post('')
  @ApiOperation({ operationId: 'postDeployment', description: 'Creates a deployment.' })
  @ApiOkResponse({ type: DeploymentDto })
  async postDeployment(@Req() req: Request, @Param('teamId') teamId: string, @Body() body: CreateDeploymentDto) {
    const command = new CreateDeployment(+teamId, body.serviceId, body.parameters, req.user);

    const result: CreateDeploymentResponse = await this.commandBus.execute(command);

    return DeploymentDto.fromDomain(result.deployment);
  }

  @Post(':id')
  @ApiOperation({ operationId: 'putDeployment', description: 'Updates a deployment.' })
  @ApiOkResponse({ type: DeploymentDto })
  async putDeployment(@Req() req: Request, id: string, @Body() body: CreateDeploymentDto) {
    const command = new UpdateDeployment(+id, body.parameters, body.serviceId, req.user);

    const result: UpdateDeploymentResponse = await this.commandBus.execute(command);

    return DeploymentDto.fromDomain(result.deployment);
  }

  @Post(':id')
  @ApiOperation({ operationId: 'deleteDeployment', description: 'Delete a deployment.' })
  @ApiNoContentResponse()
  async deleteDeployment(id: string) {
    const command = new DeleteDeployment(+id);

    await this.commandBus.execute(command);
  }
}
