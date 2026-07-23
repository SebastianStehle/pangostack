import * as https from 'https';
import { Observable, Subscriber } from 'rxjs';
import {
  Configuration,
  DeploymentApi,
  FetchError,
  PingApi,
  RequiredError,
  ResourceEventDto,
  ResourceEventDtoFromJSON,
  ResourcesApi,
  ResponseError,
  StatusApi,
} from './generated';

export type ResourceApplyStreamRequest = {
  resourceUniqueId: string;
  resourceType: string;
  parameters: Record<string, any>;
  resourceContext: Record<string, any>;
  timeoutMs: number;
};

export class WorkerClient {
  public readonly deployment: DeploymentApi;
  public readonly ping: PingApi;
  public readonly resources: ResourcesApi;
  public readonly status: StatusApi;

  constructor(
    public readonly basePath: string,
    public readonly apiKey?: string,
  ) {
    const configuration = new Configuration({
      headers: {
        ['X-ApiKey']: apiKey || '',
      },
      fetchApi: async (request, init) => {
        const agent = new https.Agent({
          rejectUnauthorized: false,
        });

        let response: Response;
        try {
          response = await fetch(request as any, { ...init, agent } as any);
        } catch (ex) {
          throw await buildError(ex);
        }

        if (response && response.status >= 200 && response.status < 300) {
          return response;
        }

        const cause = new ResponseError(response, 'Response returned an error code');
        throw await buildError(cause);
      },
      basePath,
    });

    this.deployment = new DeploymentApi(configuration);
    this.ping = new PingApi(configuration);
    this.resources = new ResourcesApi(configuration);
    this.status = new StatusApi(configuration);
  }

  // The streamed apply endpoint returns NDJSON and can therefore not be consumed with
  // the generated OpenAPI client. The event shape (ResourceEventDto) is still generated from
  // the worker OpenAPI spec, so only the transport is hand-written.
  applyResourceStreamed(request: ResourceApplyStreamRequest) {
    return new Observable<ResourceEventDto>((subscriber) => {
      const abort = new AbortController();

      void this.consumeApplyStream(request, abort, subscriber);

      return () => abort.abort();
    });
  }

  private async consumeApplyStream(
    request: ResourceApplyStreamRequest,
    abort: AbortController,
    subscriber: Subscriber<ResourceEventDto>,
  ) {
    try {
      const response = await fetch(`${this.basePath}/deployment/apply`, {
        method: 'POST',
        headers: {
          ['Content-Type']: 'application/json',
          ['X-ApiKey']: this.apiKey || '',
        },
        body: JSON.stringify(request),
        signal: abort.signal,
      });

      if (!response.ok || !response.body) {
        let body: unknown;
        try {
          body = await response.json();
        } catch {
          body = { message: 'No error details provided.', statusCode: response.status };
        }

        throw new WorkerError(response.status, body, undefined, 'Streamed apply request failed');
      }

      let hasCompleted = false;

      const handleLine = (line: string) => {
        if (!line.trim()) {
          return;
        }

        const event = ResourceEventDtoFromJSON(JSON.parse(line));
        if (event.type === 'fail') {
          throw new WorkerError(undefined, undefined, undefined, event.error ?? 'The worker reported an error.');
        }

        if (event.type === 'complete') {
          hasCompleted = true;
        }

        subscriber.next(event);
      };

      const decoder = new TextDecoder();
      let buffered = '';

      for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
        buffered += decoder.decode(chunk, { stream: true });

        // The last element is either an incomplete line or empty and is kept in the buffer.
        const lines = buffered.split('\n');
        buffered = lines.pop() ?? '';

        for (const line of lines) {
          handleLine(line);
        }
      }

      handleLine(buffered);

      if (!hasCompleted) {
        throw new WorkerError(
          undefined,
          undefined,
          undefined,
          'Stream ended without completion. The worker probably crashed or the connection was interrupted.',
        );
      }

      subscriber.complete();
    } catch (error) {
      subscriber.error(error);
    }
  }
}

export class WorkerError<T = unknown> {
  public readonly message: string;

  constructor(
    public readonly status?: number,
    public readonly body?: T,
    public readonly cause?: Error,
    message?: string,
  ) {
    this.message = WorkerError.buildMessage(status, body, message ?? cause?.message, cause);
  }

  static buildMessage(statusCode?: number, body?: unknown, message?: string, cause?: Error): string {
    const lines: string[] = [];

    if (message) {
      lines.push(message);
    }

    if (statusCode !== undefined) {
      lines.push(`Status: ${statusCode}`);
    }

    if (body !== undefined) {
      try {
        lines.push(`Body: ${JSON.stringify(body, null, 2)}`);
      } catch {
        lines.push(`Body: [unserializable]`);
      }
    }

    if (cause) {
      lines.push(`Inner: ${String(cause)}`);
    }

    return lines.length > 0 ? lines.join('\n') : 'WorkerError occurred';
  }
}

export class WorkerResponseError<T = unknown> extends WorkerError<T> {
  constructor(statusCode: number, body: T, cause?: ResponseError) {
    super(statusCode, body, cause, cause?.message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class WorkerRequiredFieldError extends WorkerError {
  constructor(cause?: RequiredError) {
    super(undefined, undefined, cause, cause?.message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export async function buildError(error: unknown): Promise<WorkerError> {
  if (error instanceof RequiredError) {
    return new WorkerRequiredFieldError(error);
  }

  if (error instanceof FetchError) {
    return new WorkerError(undefined, undefined, error, error.message);
  }

  if (error instanceof ResponseError) {
    const statusCode = error.response.status;
    let body: unknown;

    try {
      body = await error.response.json();
    } catch {
      body = { message: 'No error details provided.', statusCode };
    }

    return new WorkerResponseError(statusCode, body, error);
  }

  return new WorkerError(undefined, undefined, error as Error, 'Unknown error occurred');
}
