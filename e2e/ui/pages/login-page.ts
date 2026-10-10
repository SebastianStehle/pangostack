import { Locator, Page } from '@playwright/test';
import { texts } from '../texts';

export class LoginPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.email = page.getByPlaceholder(texts.common.email);
    this.password = page.getByPlaceholder(texts.common.password);
    this.submit = page.getByRole('button', { name: texts.common.loginButton });
    this.error = page.getByText(texts.common.loginFailed);
  }

  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
