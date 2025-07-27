import { useMemo } from 'react';
import { Observable, share } from 'rxjs';
import { useTransientNavigate } from 'src/hooks';
import {
  AuthApi,
  Configuration,
  ConversationApi,
  ExtensionsApi,
  FilesApi,
  Middleware,
  SettingsApi,
  StreamEventDto,
  UsagesApi,
  UsersApi,
} from './generated';
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
  public readonly conversations: ConversationApi;
  public readonly extensions: ExtensionsApi;
  public readonly files: FilesApi;
  public readonly settings: SettingsApi;
  public readonly stream: StreamApi;
  public readonly usages: UsagesApi;
  public readonly users: UsersApi;

  public get url() {
    return this.configuration.basePath;
  }

  constructor(
    private readonly configuration: Configuration,
    middleware: Middleware,
  ) {
    this.stream = new StreamApi(configuration);

    this.auth = new AuthApi(configuration).withMiddleware(middleware);

    this.conversations = new ConversationApi(configuration).withMiddleware(middleware);

    this.extensions = new ExtensionsApi(configuration).withMiddleware(middleware);

    this.files = new FilesApi(configuration).withMiddleware(middleware);

    this.settings = new SettingsApi(configuration).withMiddleware(middleware);

    this.usages = new UsagesApi(configuration).withMiddleware(middleware);

    this.users = new UsersApi(configuration).withMiddleware(middleware);
  }
}

export class StreamApi {
  constructor(private readonly configuration: Configuration) {}

  streamPrompt(conversationId: number, input: string): Observable<StreamEventDto> {
    return new Observable<StreamEventDto>((subscriber) => {
      const source = new EventSource(
        `${this.configuration.basePath}/conversations/${conversationId}/messages/sse?input=${encodeURIComponent(input)}`,
        {
          withCredentials: true,
        },
      );

      source.addEventListener('message', (event) => {
        if (!event) {
          source.close();

          subscriber.complete();
        } else {
          subscriber.next(JSON.parse(event.data));
        }
      });

      source.addEventListener('error', (event) => {
        const data = (event as any)['data'];

        try {
          if (data) {
            try {
              subscriber.error(JSON.parse(data).message);
            } finally {
              subscriber.error(data);
            }
          }
        } finally {
          subscriber.complete();
          source.close();
        }
      });

      return () => {
        source.close();
      };
    }).pipe(share());
  }
}
