import { Locator, Page } from '@playwright/test';
import { texts } from '../texts';
import { fillCodeEditor, getFormRow } from './elements';

export class AdminNewVersionPage {
  readonly verifySuccess: Locator;

  constructor(private readonly page: Page) {
    this.verifySuccess = page.getByText(texts.services.verifySuccess);
  }

  async goto(serviceId: number) {
    await this.page.goto(`/admin/services/${serviceId}/versions/new`);
  }

  async setDefinition(yaml: string) {
    await fillCodeEditor(getFormRow(this.page, texts.services.definition), yaml);
  }

  async save(name: string) {
    await this.page.getByLabel(texts.common.name).fill(name);
    await this.page.getByRole('button', { name: texts.common.save }).click();
  }

  async verify() {
    await this.page.getByRole('button', { name: texts.services.verify }).click();
  }
}
