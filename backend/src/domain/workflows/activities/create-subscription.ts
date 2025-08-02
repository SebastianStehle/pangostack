import { Injectable } from '@nestjs/common';
import { BillingService } from 'src/domain/billing';

export interface CreateSubscriptionParams {
  deploymentId: number;
  teamId: number;
}

@Injectable()
export class CreateSubscriptionActivity {
  constructor(private readonly billingService: BillingService) {}

  async execute({ deploymentId, teamId }: CreateSubscriptionParams): Promise<any> {
    await this.billingService.createSubscription(teamId, deploymentId);
  }
}

export async function createSubscription(param: CreateSubscriptionParams): Promise<any> {
  return param;
}
