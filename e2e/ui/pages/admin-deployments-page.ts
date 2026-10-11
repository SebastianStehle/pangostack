import { Page } from '@playwright/test';

export class AdminDeploymentsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/admin/deployments');
  }

  async open(deploymentId: number) {
    await this.page.getByRole('link', { name: `${deploymentId}`, exact: true }).click();
  }
}
