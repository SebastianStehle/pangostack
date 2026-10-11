import { Locator, Page } from '@playwright/test';
import { texts } from '../texts';

export class TeamCreatePage {
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: texts.teams.createTitle });
  }

  async goto() {
    await this.page.goto('/teams/create');
  }

  async create(name: string) {
    await this.page.getByLabel(texts.common.name).fill(name);
    await this.page.getByRole('button', { name: texts.common.save }).click();
  }
}
