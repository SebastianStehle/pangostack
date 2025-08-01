import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BillingService } from 'src/domain/billing';
import { BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import { IntParam } from 'src/lib';
import { TeamPermissionGuard } from '../TeamPermissionGuard';
import { BillingStatusDto, InvoicesDto } from './dtos';

@Controller('teams/:teamId')
@ApiParam({
  name: 'teamId',
  description: 'The ID of the team.',
  required: true,
  type: 'number',
})
@ApiTags('billing')
@ApiSecurity('x-api-key')
@UseGuards(LocalAuthGuard)
export class TeamBillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('billing/status')
  @ApiOperation({ operationId: 'getBillingStatus', description: 'Gets the status of the billing setup.' })
  @ApiOkResponse({ type: BillingStatusDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard, TeamPermissionGuard)
  async getBillingStatus(@IntParam('teamId') teamId: number, @Query('redirectUrl') redirectUrl?: string) {
    const hasCard = await this.billingService.hasPaymentDetails(teamId);
    if (hasCard) {
      return BillingStatusDto.valid();
    }

    const link = await this.billingService.getCardDetailsLink(teamId, redirectUrl);
    return BillingStatusDto.invalid(link);
  }

  @Get('invoices')
  @ApiOperation({ operationId: 'getInvoices', description: 'Gets all invoices.' })
  @ApiOkResponse({ type: InvoicesDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard, TeamPermissionGuard)
  async getInvoices(@IntParam('teamId') teamId: number) {
    const invoices = await this.billingService.getInvoices(teamId);

    return InvoicesDto.fromDomain(invoices);
  }

  @Get('deployments/:deploymentId/invoices')
  @ApiOperation({ operationId: 'getDeploymentInvoices', description: 'Gets all deployment invoices.' })
  @ApiParam({
    name: 'deploymentId',
    description: 'The ID of the deployment.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: InvoicesDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard, TeamPermissionGuard)
  async getDeploymentInvoices(@IntParam('teamId') teamId: number, @IntParam('deploymentId') deploymentId: number) {
    const invoices = await this.billingService.getInvoices(teamId, deploymentId);

    return InvoicesDto.fromDomain(invoices);
  }
}
