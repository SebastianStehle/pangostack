import { useMemo } from 'react';
import { useTransientNavigate } from 'src/hooks';
import { AuthApi, Configuration, DeploymentsApi, Middleware, ServicesApi, SettingsApi, TeamsApi, UsersApi } from './generated';
export * from './generated';

export function useApi() {
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
  public readonly deploymentsApi: DeploymentsApi;
  public readonly teamsApi: TeamsApi;
  public readonly servicesApi: ServicesApi;
  public readonly settings: SettingsApi;
  public readonly users: UsersApi;

  public get url() {
    return this.configuration.basePath;
  }

  constructor(
    private readonly configuration: Configuration,
    middleware: Middleware,
  ) {
    this.auth = new AuthApi(configuration).withMiddleware(middleware);

    this.deploymentsApi = new DeploymentsApi(configuration).withMiddleware(middleware);

    this.servicesApi = new ServicesApi(configuration).withMiddleware(middleware);

    this.teamsApi = new TeamsApi(configuration).withMiddleware(middleware);

    this.settings = new SettingsApi(configuration).withMiddleware(middleware);

    this.users = new UsersApi(configuration).withMiddleware(middleware);
  }
}
