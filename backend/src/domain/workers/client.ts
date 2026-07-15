import * as https from 'https';
import { Observable, Subscriber } from 'rxjs';
import {
  Configuration,
  DeploymentApi,
  FetchError,
  RequiredError,
  ResourceApplyResponseDto,
  ResourcesApi,
  ResponseError,
  StatusApi,
} from './generated';

export type WorkerSubStep = {
  name: string;
  status: 'Running' | 'Completed' | 'Failed';
  message?: string | null;
  startedAt: string;
  completedAt?: string | null;
};

export type ResourceApplyStreamEvent =
  | { type: 'subSteps'; subSteps: WorkerSubStep[] }
  | { type: 'result'; result: ResourceApplyResponseDto }
  | { type: 'error'; error: string };

export type ResourceApplyStreamRequest = {
  resourceUniqueId: string;
  resourceType: string;
  parameters: Record<string, any>;
  resourceContext: Record<string, any>;
  timeoutMs: number;
};

export class WorkerClient {
  public readonly deployment: DeploymentApi;
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
    this.resources = new ResourcesApi(configuration);
    this.status = new StatusApi(configuration);
  }

  // The streamed apply endpoint returns NDJSON and can therefore not be consumed with
  // the generated OpenAPI client.
  applyResourceStreamed(request: ResourceApplyStreamRequest) {
    return new Observable<ResourceApplyStreamEvent>((subscriber) => {
      const abort = new AbortController();

      void this.consumeApplyStream(request, abort, subscriber);

      return () => abort.abort();
    });
  }

  private async consumeApplyStream(
    request: ResourceApplyStreamRequest,
    abort: AbortController,
    subscriber: Subscriber<ResourceApplyStreamEvent>,
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

      let hasResult = false;

      const handleLine = (line: string) => {
        if (!line.trim()) {
          return;
        }

        const event = JSON.parse(line) as ResourceApplyStreamEvent;
        if (event.type === 'error') {
          throw new WorkerError(undefined, undefined, undefined, event.error);
        }

        if (event.type === 'result') {
          hasResult = true;
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

      if (!hasResult) {
        throw new WorkerError(
          undefined,
          undefined,
          undefined,
          'Stream ended without a result. The worker probably crashed or the connection was interrupted.',
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
