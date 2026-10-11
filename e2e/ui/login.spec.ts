import { createAdminClients } from 'src/shared/clients';
import { config } from 'src/shared/config';
import { createUser, TestUser } from 'src/shared/setup';
import { ANONYMOUS, expect, test } from './fixtures';

test.use({ storageState: ANONYMOUS });

test('should show error when password is wrong', async ({ loginPage }) => {
  // STEP 1: Login with a wrong password.
  await loginPage.login(config.adminEmail, 'wrong-password');

  await expect(loginPage.error).toBeVisible();
  await expect(loginPage.submit).toBeVisible();
});

test.describe('as end user', () => {
  let user: TestUser;

  test.beforeEach(async ({ loginPage }) => {
    user = await createUser(createAdminClients());

    await loginPage.login(user.email, user.password);
  });

  test('should ask new user to create a team after login', async ({ teamCreatePage }) => {
    await expect(teamCreatePage.heading).toBeVisible();
  });

  test('should keep non-admin out of administration', async ({ adminServicesPage, teamCreatePage }) => {
    await expect(teamCreatePage.heading).toBeVisible();

    // STEP 1: Open administration.
    await adminServicesPage.goto();

    await expect(teamCreatePage.heading).toBeVisible();
    await expect(adminServicesPage.heading).toBeHidden();
  });
});
