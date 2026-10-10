import { Locator, Page } from '@playwright/test';
import { texts } from '../texts';

export class AdminDeploymentPage {
  readonly status: Locator;
  readonly deleteConfirmed: Locator;

  constructor(private readonly page: Page) {
    this.status = page.getByRole('group', { name: 'Status', exact: true });
    this.deleteConfirmed = page.getByText(texts.deployments.deleteConfirmed);
  }

  async goto(deploymentId: number) {
    await this.page.goto(`/admin/deployments/${deploymentId}`);
  }

  async delete() {
    await this.page.getByRole('button', { name: texts.deployments.deleteConfirmTitle }).click();
    await this.page.getByRole('button', { name: texts.common.yes }).click();
  }
}
