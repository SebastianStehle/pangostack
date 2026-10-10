import { Page } from '@playwright/test';

export class AdminServicePage {
  constructor(private readonly page: Page) {}

  heading(serviceName: string) {
    return this.page.getByRole('heading', { name: serviceName, exact: true }).first();
  }

  version(name: string) {
    return this.page.getByRole('row', { name });
  }
}
