import { Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BillingService } from 'src/domain/billing';
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
import { saveAndFind } from 'src/lib';
import { Activity } from '../registration';

export type ChargeDeploymentParam = {
  dateFrom: string;
  dateTo: string;
  deploymentId: number;
};

export type AggregatedUsage = {
  deploymentId: number;
  totalCores: number;
  totalMemoryGB: number;
  totalVolumeGB: number;
  totalStorageGB: number;
  fixedPricing: number;
};

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
    const updates = await this.deploymentUpdates.find({
      where: { deploymentId },
      order: { id: 'DESC' },
      relations: ['serviceVersion', 'serviceVersion.service'],
    });

    if (updates.length === 0) {
      // Throw an error to make the tracking easier.
      throw new NotFoundException(`Update for deployment ${deploymentId} not found`);
    }

    const update = updates.find((x) => x.status === 'Completed');
    if (!update) {
      // Deployment has not been completed yet. This is normal behavior.
      return;
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

    const service = update.serviceVersion.service;

    const usage = await this.deploymentUsages
      .createQueryBuilder('usage')
      .select('usage.deploymentId', 'deploymentId')
      .addSelect('SUM(usage.fixedPricing)', 'fixedPricing')
      .addSelect('SUM(usage.totalCores)', 'totalCores')
      .addSelect('SUM(usage.totalMemoryGB)', 'totalMemoryGB')
      .addSelect('SUM(usage.totalVolumeGB)', 'totalVolumeGB')
      .addSelect('MAX(usage.totalStorageGB)', 'totalStorageGB')
      .where('usage.trackDate BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo })
      .where('usage.deploymentId = :deploymentId', { deploymentId })
      .groupBy('usage.deploymentId')
      .getRawOne<AggregatedUsage>();

    const { totalCores, totalMemoryGB, totalStorageGB, totalVolumeGB, fixedPricing } = usage || {
      totalCores: 0,
      totalMemoryGB: 0,
      totalStorageGB: 0,
      totalVolumeGB: 0,
      fixedPricing: 0,
    };

    const fixedPrice = service.fixedPrice + fixedPricing;
    if (fixedPrice > 0 || totalCores > 0 || totalMemoryGB > 0 || totalVolumeGB > 0 || fixedPrice > 0) {
      const charges = {
        dateFrom: dateFrom,
        dateTo: dateTo,
        fixedPrice: service.fixedPrice + fixedPricing,
        pricePerCoreHour: service.pricePerCoreHour,
        pricePerMemoryGBHour: service.pricePerMemoryGBHour,
        pricePerStorageGBMonth: service.pricePerStorageGBMonth,
        pricePerVolumeGBHour: service.pricePerVolumeGBHour,
        totalCoreHours: totalCores,
        totalMemoryGBHours: totalMemoryGB,
        totalStorageGB: totalStorageGB,
        totalVolumeGBHours: totalVolumeGB,
      };

      this.logger.log(`Deployment ${deploymentId} charged.`, { charges });
      await this.billingService.chargeDeployment(deployment.teamId, deploymentId, charges);
    }

    // Ensure that we bill every month only once per user.
    await saveAndFind(this.billedDeployments, { deploymentId, dateFrom, dateTo });
  }
}

export async function chargeDeployment(param: ChargeDeploymentParam): Promise<any> {
  return param;
}
