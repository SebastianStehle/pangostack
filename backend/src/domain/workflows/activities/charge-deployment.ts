import { Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between } from 'typeorm';
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

    const definition = update.serviceVersion.definition;
    const service = update.serviceVersion.service;
    const usages = await this.deploymentUsages.find({ where: { deploymentId, trackDate: Between(dateFrom, dateTo) } });

    const charges: Charges = {
      dateFrom: dateFrom,
      dateTo: dateTo,
      items: [],
      fixedPrice: service.fixedPrice,
      fixedPriceDescription: service.fixedPriceDescription,
    };

    let totalCores = 0;
    let totalMemoryGB = 0;
    let totalStorageGB = 0;
    let totalVolumeGB = 0;
    const additionals: Record<string, { quantity: number; pricePerUnit: number }> = {};
    for (const usage of usages) {
      totalCores += usage.totalCores;
      totalMemoryGB += usage.totalMemoryGB;
      totalStorageGB += usage.totalStorageGB;
      totalVolumeGB += usage.totalVolumeGB;

      if (definition.prices) {
        for (const [identifier, additional] of Object.entries(usage.additionalPrices)) {
          if (additional.quantity <= 0) {
            continue;
          }

          const price = definition.prices.find((x) => x.billingIdentifier === identifier);
          if (!price || additional.quantity <= 0) {
            continue;
          }

          const sum = (additionals[identifier] ||= { quantity: 0, pricePerUnit: price.pricePerHour });
          sum.quantity += additional.quantity;
        }
      }
    }

    for (const [identifier, additional] of Object.entries(additionals)) {
      charges.items.push({ identifier, ...additional });
    }

    if (totalCores > 0) {
      charges.items.push({ identifier: 'core', quantity: totalCores, pricePerUnit: service.pricePerCoreHour });
    }

    if (totalMemoryGB > 0) {
      charges.items.push({ identifier: 'memory', quantity: totalMemoryGB, pricePerUnit: service.pricePerMemoryGBHour });
    }

    if (totalMemoryGB > 0) {
      charges.items.push({ identifier: 'storage', quantity: totalStorageGB, pricePerUnit: service.pricePerStorageGBMonth });
    }

    if (totalVolumeGB > 0) {
      charges.items.push({ identifier: 'volume', quantity: totalVolumeGB, pricePerUnit: service.pricePerVolumeGBHour });
    }

    if (charges.items.length > 0 || (charges.fixedPrice && charges.fixedPriceDescription)) {
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
