import { Page } from '@playwright/test';
import { texts } from '../texts';

// The form to create and to edit a deployment.
export class DeploymentFormPage {
  constructor(private readonly page: Page) {}

  async deploy(parameters: Record<string, string>) {
    for (const [label, value] of Object.entries(parameters)) {
      await this.page.getByLabel(label).fill(value);
    }

    await this.page.getByRole('button', { name: texts.deployments.deployButton }).click();
  }
}
