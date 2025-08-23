import * as https from 'https';
import { Configuration, DeploymentApi, FetchError, RequiredError, ResponseError, StatusApi } from './generated';

export class WorkerClient {
  public readonly deployment: DeploymentApi;
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

    this.status = new StatusApi(configuration);
  }
}

export class WorkerError<T = unknown> extends Error {
  constructor(
    public readonly status?: number,
    public readonly body?: T,
    public readonly cause?: Error,
    message?: string,
  ) {
    super(WorkerError.buildMessage(status, body, message ?? cause?.message, cause));
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
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
  if (error instanceof FetchError) {
    return new WorkerError(undefined, undefined, error, error.message);
  }

  if (error instanceof RequiredError) {
    return new WorkerRequiredFieldError(error);
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
