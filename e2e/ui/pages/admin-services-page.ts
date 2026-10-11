import { Locator, Page } from '@playwright/test';
import { texts } from '../texts';
import { fillMarkdownEditor, getDialog, getFormRow } from './elements';

export class AdminServicesPage {
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: texts.services.headline, exact: true });
  }

  async goto() {
    await this.page.goto('/admin/services');
  }

  async create(name: string, description: string) {
    await this.page.getByTitle(texts.services.create).click();

    const dialog = getDialog(this.page, texts.services.create);
    await dialog.getByLabel(texts.common.name).fill(name);
    await fillMarkdownEditor(getFormRow(this.page, texts.common.description), description);
    await dialog.getByRole('button', { name: texts.common.save }).click();
  }
}
