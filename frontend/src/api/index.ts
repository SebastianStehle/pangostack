import { useMemo } from 'react';
import { useTransientNavigate } from 'src/hooks';
import {
  AuthApi,
  BillingApi,
  Configuration,
  DeploymentsApi,
  Middleware,
  ServicesApi,
  SettingsApi,
  TeamsApi,
  UsersApi,
  WorkersApi,
} from './generated';
export * from './generated';

export function useClients() {
  const navigate = useTransientNavigate();

  return useMemo(() => {
    const configuration = new Configuration({
      basePath: import.meta.env.VITE_SERVER_URL || '',
    });

    const middleware: Middleware = {
      pre: (context) => {
        context.init.credentials = 'include';

        return Promise.resolve();
      },
      post: (context) => {
        if (context.response?.status === 401 || context.response?.status === 403) {
          navigate('/login');
        }

        return Promise.resolve();
      },
    };

    return new AppClient(configuration, middleware);
  }, [navigate]);
}

export class AppClient {
  public readonly auth: AuthApi;
  public readonly billing: BillingApi;
  public readonly deployments: DeploymentsApi;
  public readonly teams: TeamsApi;
  public readonly services: ServicesApi;
  public readonly settings: SettingsApi;
  public readonly users: UsersApi;
  public readonly workers: WorkersApi;

  public get url() {
    return this.configuration.basePath;
  }

  constructor(
    private readonly configuration: Configuration,
    middleware: Middleware,
  ) {
    this.auth = new AuthApi(configuration).withMiddleware(middleware);
    this.billing = new BillingApi(configuration).withMiddleware(middleware);
    this.deployments = new DeploymentsApi(configuration).withMiddleware(middleware);
    this.services = new ServicesApi(configuration).withMiddleware(middleware);
    this.teams = new TeamsApi(configuration).withMiddleware(middleware);
    this.settings = new SettingsApi(configuration).withMiddleware(middleware);
    this.users = new UsersApi(configuration).withMiddleware(middleware);
    this.workers = new WorkersApi(configuration).withMiddleware(middleware);
  }
}
