import { Page } from '@playwright/test';
import { texts } from '../texts';

export class MembersPage {
  constructor(private readonly page: Page) {}

  async goto(teamId: number) {
    await this.page.goto(`/teams/${teamId}/members`);
  }

  async reload() {
    await this.page.reload();
  }

  member(email: string) {
    return this.page.getByRole('row', { name: email });
  }

  async add(email: string) {
    await this.page.getByPlaceholder(texts.common.email).fill(email);
    await this.page.getByRole('button', { name: texts.members.addMemberButton }).click();
  }

  async remove(email: string) {
    await this.member(email).getByRole('button', { name: texts.members.removeConfirmTitle }).click();
    await this.page.getByRole('button', { name: texts.common.yes }).click();
  }
}
