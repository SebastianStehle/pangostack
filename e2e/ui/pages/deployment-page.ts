import { Locator, Page } from '@playwright/test';
import { texts } from '../texts';

export class DeploymentPage {
  readonly status: Locator;

  constructor(private readonly page: Page) {
    this.status = this.property('Status');
  }

  async goto(teamId: number, deploymentId: number) {
    await this.page.goto(`/teams/${teamId}/deployments/${deploymentId}`);
  }

  property(label: string) {
    return this.page.getByRole('group', { name: label, exact: true });
  }

  resource(name: string) {
    return this.page.locator('.card', { has: this.page.getByRole('heading', { name, exact: true }) });
  }

  subStep(resourceName: string, name: string) {
    return this.resource(resourceName).getByText(name);
  }

  stepError(text: string) {
    return this.page.getByRole('alert').filter({ hasText: text });
  }

  logOutput(text: string) {
    return this.page.getByText(text);
  }

  async expandSteps(resourceName: string) {
    await this.resource(resourceName).getByText(texts.deployments.steps).click();
  }

  async openLogs() {
    await this.page.getByRole('tab', { name: texts.common.logViewer }).click();
  }

  async edit() {
    await this.page.getByRole('link', { name: texts.deployments.edit }).click();
  }
}
