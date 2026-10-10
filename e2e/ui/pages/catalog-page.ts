import { Page } from '@playwright/test';

export class CatalogPage {
  constructor(private readonly page: Page) {}

  async goto(teamId: number) {
    await this.page.goto(`/teams/${teamId}/deployments/new`);
  }

  service(name: string) {
    return this.page.getByRole('link', { name });
  }

  async select(name: string) {
    await this.service(name).click();
  }
}
