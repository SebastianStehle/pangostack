import { BillingService } from 'src/domain/billing';
import { Activity } from '../registration';

export type CreateSubscriptionParams = {
  deploymentId: number;
  teamId: number;
};

@Activity(createSubscription)
export class CreateSubscriptionActivity implements Activity<CreateSubscriptionParams, any> {
  constructor(private readonly billingService: BillingService) {}

  async execute({ deploymentId, teamId }: CreateSubscriptionParams) {
    await this.billingService.createSubscription(teamId, deploymentId);
  }
}

export async function createSubscription(param: CreateSubscriptionParams): Promise<any> {
  return param;
}
