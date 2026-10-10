import { AuthApi, Configuration, DeploymentsApi, ResponseError, ServicesApi, TeamsApi, UsersApi, WorkersApi } from 'src/api/generated';
import { config } from './config';

export type Credentials = { apiKey?: string; cookie?: string };

export function createClients({ apiKey, cookie }: Credentials = {}) {
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  if (cookie) {
    headers['cookie'] = cookie;
  }

  const configuration = new Configuration({ basePath: config.serverUrl, headers });

  return {
    auth: new AuthApi(configuration),
    deployments: new DeploymentsApi(configuration),
    services: new ServicesApi(configuration),
    teams: new TeamsApi(configuration),
    users: new UsersApi(configuration),
    workers: new WorkersApi(configuration),
  };
}

export type Clients = ReturnType<typeof createClients>;

export function createAdminClients() {
  return createClients({ apiKey: config.apiKey });
}

// Logs in like the browser does, so that the returned clients authenticate with the session cookie.
export async function loginWithPassword(email: string, password: string) {
  const { raw } = await createClients().auth.loginRaw({ loginDto: { email, password } });

  return createClients({ cookie: getCookieHeader(raw) });
}

function getCookieHeader(response: Response) {
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(';')[0])
    .join('; ');
}

export async function getStatusCode(action: () => Promise<unknown>) {
  try {
    await action();
  } catch (ex) {
    if (ex instanceof ResponseError) {
      return ex.response.status;
    }
    throw ex;
  }

  throw new Error('Expected the request to fail, but it succeeded.');
}
