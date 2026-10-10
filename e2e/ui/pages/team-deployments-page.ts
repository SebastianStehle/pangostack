import { Locator, Page } from '@playwright/test';
import { texts } from '../texts';

export class TeamDeploymentsPage {
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: texts.deployments.headline, exact: true });
  }

  async goto(teamId: number) {
    await this.page.goto(`/teams/${teamId}/deployments`);
  }

  teamSwitcher(teamName: string) {
    return this.page.getByRole('button', { name: teamName });
  }

  deployment(serviceName: string) {
    return this.page.getByRole('link', { name: serviceName });
  }
}
