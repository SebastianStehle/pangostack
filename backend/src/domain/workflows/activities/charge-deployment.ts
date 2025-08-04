import { Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BillingService, Charges } from 'src/domain/billing';
import {
  BilledDeploymentEntity,
  BilledDeploymentRepository,
  DeploymentEntity,
  DeploymentRepository,
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  DeploymentUsageEntity,
  DeploymentUsageRepository,
} from 'src/domain/database';
import { Activity } from '../registration';

export interface ChargeDeploymentParam {
  dateFrom: string;
  dateTo: string;
  deploymentId: number;
}

interface AggregatedUsage {
  deploymentId: number;
  totalCores: number;
  totalMemoryGB: number;
  totalVolumeGB: number;
  totalStorageGB: number;
}

@Activity(chargeDeployment)
export class ChargeDeploymentActivity implements Activity<ChargeDeploymentParam> {
  private readonly logger = new Logger(ChargeDeploymentActivity.name);

  constructor(
    private readonly billingService: BillingService,
    @InjectRepository(BilledDeploymentEntity)
    private readonly billedDeployments: BilledDeploymentRepository,
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(DeploymentUsageEntity)
    private readonly deploymentUsages: DeploymentUsageRepository,
  ) {}

  async execute({ deploymentId, dateFrom, dateTo }: ChargeDeploymentParam) {
    const update = await this.deploymentUpdates.findOne({
      where: { deploymentId, status: 'Completed' },
      order: { id: 'DESC' },
      relations: ['serviceVersion', 'serviceVersion.service'],
    });

    if (!update) {
      throw new NotFoundException(`Update for deployment ${deploymentId} not found`);
    }

    const deployment = await this.deployments.findOne({
      where: { id: deploymentId },
      relations: ['team'],
    });

    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    const billed = await this.billedDeployments.findOneBy({ deploymentId, dateFrom, dateTo });
    if (billed) {
      this.logger.warn(`Deployment ${deploymentId} has already been billed.`);
      return;
    }

    const results = await this.deploymentUsages
      .createQueryBuilder('d')
      .select('d.deploymentId', 'deploymentId')
      .addSelect('SUM(d.totalCores)', 'totalCores')
      .addSelect('SUM(d.totalMemoryGB)', 'totalMemoryGB')
      .addSelect('SUM(d.totalVolumeGB)', 'totalVolumeGB')
      .addSelect('MAX(d.totalStorageGB)', 'totalStorageGB')
      .where('d.trackDate BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo })
      .where('d.deploymentId = :deploymentId', { deploymentId })
      .groupBy('d.deploymentId')
      .getRawOne<AggregatedUsage>();

    const { totalCores, totalMemoryGB, totalStorageGB, totalVolumeGB } = results;
    if (totalCores === 0 && totalMemoryGB === 0 && totalStorageGB === 0 && totalVolumeGB === 0) {
      return;
    }

    const service = update.serviceVersion.service;

    const charges: Charges = {
      dateFrom: dateFrom,
      dateTo: dateTo,
      fixedPrice: service.fixedPrice,
      pricePerCoreHour: service.pricePerCoreHour,
      pricePerMemoryGBHour: service.pricePerMemoryGBHour,
      pricePerStorageGBMonth: service.pricePerStorageGBMonth,
      pricePerVolumeGBHour: service.pricePerVolumeGBHour,
      totalCoreHours: totalCores,
      totalMemoryGBHours: totalMemoryGB,
      totalStorageGB: totalStorageGB,
      totalVolumeGBHours: totalVolumeGB,
    };

    this.logger.warn(`Deployment ${deploymentId} billed.`, { charges });
    await this.billingService.chargeDeployment(deployment.teamId, deploymentId, charges);

    // Ensure that we bill every month only once per user.
    await this.billedDeployments.save({ deploymentId, dateFrom, dateTo });
  }
}

export async function chargeDeployment(param: ChargeDeploymentParam): Promise<any> {
  return param;
}
