import { Page } from '@playwright/test';
import { texts } from '../texts';
import { getDialog } from './elements';

export type NewUser = { name: string; email: string; password: string };

export class AdminUsersPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/admin/users');
  }

  user(email: string) {
    return this.page.getByRole('row', { name: email });
  }

  async create({ name, email, password }: NewUser) {
    await this.page.getByRole('button', { name: texts.users.create }).click();

    const dialog = getDialog(this.page, texts.users.create);
    await dialog.getByLabel(texts.common.name).fill(name);
    await dialog.getByLabel(texts.common.email).fill(email);
    await dialog.getByLabel(texts.common.userGroup).selectOption('default');
    await dialog.getByLabel(texts.common.password, { exact: true }).fill(password);
    await dialog.getByLabel(texts.common.passwordConfirm).fill(password);
    await dialog.getByRole('button', { name: texts.common.save }).click();
  }
}
