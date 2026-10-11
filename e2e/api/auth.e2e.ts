import { describe, expect, it } from 'vitest';
import { createAdminClients, createClients, getStatusCode, loginWithPassword } from 'src/shared/clients';
import { config } from 'src/shared/config';

describe('auth', () => {
  it('should authenticate when api key is sent', async () => {
    // STEP 1: Get the profile with the api key.
    const profile = await createAdminClients().auth.getProfile();
    expect(profile).toMatchObject({ email: config.adminEmail, isAdmin: true });
  });

  it('should reject request when no credentials are sent', async () => {
    // STEP 1: Get the profile without credentials.
    const status = await getStatusCode(() => createClients().auth.getProfile());
    expect(status).toBe(401);
  });

  it('should keep session when logged in with password', async () => {
    // STEP 1: Login with password.
    const session = await loginWithPassword(config.adminEmail, config.adminPassword);

    // STEP 2: Get the profile with the session cookie.
    const profile = await session.auth.getProfile();
    expect(profile.email).toBe(config.adminEmail);
  });

  it('should reject login when password is wrong', async () => {
    // STEP 1: Login with a wrong password.
    const status = await getStatusCode(() => createClients().auth.login({ email: config.adminEmail, password: 'wrong-password' }));
    expect(status).toBe(400);
  });
});
