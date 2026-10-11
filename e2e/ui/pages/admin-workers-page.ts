import { Page } from '@playwright/test';

export class AdminWorkersPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/admin/workers');
  }

  worker(endpoint: string) {
    return this.page.getByRole('row', { name: endpoint });
  }
}
