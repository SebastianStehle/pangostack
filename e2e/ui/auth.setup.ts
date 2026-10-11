import { expect, test as setup } from '@playwright/test';
import { config } from 'src/shared/config';
import { ADMIN_STATE } from './auth-state';
import { LoginPage } from './pages/login-page';

setup('authenticate as admin', async ({ page }) => {
  await new LoginPage(page).login(config.adminEmail, config.adminPassword);
  await expect(page).toHaveURL(/\/teams\//);

  await page.context().storageState({ path: ADMIN_STATE });
});
